import React from 'react';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import { Node } from 'slate';
import config from '@plone/volto/registry';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import { serializeNodes as _serializeNodes } from '@plone/volto-slate/editor/render';

// -- palette ----------------------------------------------------------------
// The colour fields are `style_simple_color` widgets, so what lands in the
// block data is a raw hex value. These are the EEA Design System tokens offered
// to the editor (see references/DESIGN.md); the value itself is not restricted
// at render time, so every helper below degrades gracefully on anything else.
export const COLOR_BLUE_5 = '#004B7F'; // marine primary
export const COLOR_BLUE_6 = '#003052';
export const COLOR_GREEN_6 = '#005248';
export const COLOR_BLUE_GREY_6 = '#2E3E4C';
export const COLOR_BLUE_GREY_5 = '#3D5265';
export const COLOR_BLUE_GREY_0 = '#DAE8F4';
export const COLOR_GREY_1 = '#F9F9F9';
export const COLOR_GREY_2 = '#E6E7E8';
export const COLOR_WHITE = '#FFFFFF';

export const EEA_COLORS = [
  COLOR_BLUE_5,
  COLOR_BLUE_6,
  COLOR_GREEN_6,
  COLOR_BLUE_GREY_6,
  COLOR_BLUE_GREY_0,
  COLOR_GREY_1,
  COLOR_GREY_2,
  COLOR_WHITE,
];

export const DEFAULT_GROUP_BACKGROUND = COLOR_BLUE_5;
export const DEFAULT_CARD_BACKGROUND = COLOR_WHITE;

export const TEXT_ON_DARK = COLOR_WHITE;
export const TEXT_ON_LIGHT = COLOR_BLUE_GREY_5;

// -- colour maths -----------------------------------------------------------
// A card is a colour the editor chose; the text colour and the icon treatment
// must follow from it, otherwise an accessible combination depends on the
// editor remembering a second field. `getTextColor` picks whichever of the two
// text colours has the higher WCAG contrast ratio against the background.
const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const parseHexColor = (value) => {
  if (!isString(value)) return null;
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) return null;
  const digits =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((digit) => `${digit}${digit}`)
          .join('')
      : match[1];
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  };
};

const linearize = (channel) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (color) => {
  const rgb = isString(color) ? parseHexColor(color) : color;
  if (!rgb) return null;
  return (
    0.2126 * linearize(rgb.r) +
    0.7152 * linearize(rgb.g) +
    0.0722 * linearize(rgb.b)
  );
};

export const contrastRatio = (colorA, colorB) => {
  const luminanceA = relativeLuminance(colorA);
  const luminanceB = relativeLuminance(colorB);
  if (luminanceA === null || luminanceB === null) return null;
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getTextColor = (background) => {
  const onDark = contrastRatio(background, TEXT_ON_DARK);
  const onLight = contrastRatio(background, TEXT_ON_LIGHT);
  if (onDark === null || onLight === null) return TEXT_ON_LIGHT;
  return onDark >= onLight ? TEXT_ON_DARK : TEXT_ON_LIGHT;
};

export const isDarkColor = (background) =>
  getTextColor(background) === TEXT_ON_DARK;

// -- icons ------------------------------------------------------------------
// The `image` widget stores a URL string when used inside an object list, but
// an object (with `image_scales`) when it is fed a selected item, so both
// shapes are accepted. Internal URLs get the Plone image traversal appended,
// which is also what Volto's own image block falls back to.
const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

export const getIconURL = (icon, scale = 'image') => {
  if (!icon) return null;

  if (isString(icon)) {
    return isInternalURL(icon)
      ? `${stripTrailingSlash(flattenToAppURL(icon))}/@@images/${scale}`
      : icon;
  }

  if (isArray(icon)) {
    const first = icon[0];
    return getIconURL(isString(first) ? first : first?.['@id'], scale);
  }

  const id = icon['@id'];
  if (!id) return null;
  const field = icon.image_field || 'image';
  const download = icon.image_scales?.[field]?.[0]?.download;
  const base = stripTrailingSlash(flattenToAppURL(id));
  return download ? `${base}/${download}` : `${base}/@@images/${scale}`;
};

export const getIconAlt = (icon, fallback = '') => {
  if (!icon) return fallback;
  if (isString(icon)) return fallback;
  return icon.title || icon['@title'] || fallback;
};

// -- links ------------------------------------------------------------------
// The `url` widget stores whatever the editor picked: an internal path (often
// with the site root prepended) or an absolute external URL. Internal links are
// flattened to the app URL so they keep working behind the Volto router;
// external ones are marked so the view can open them in a new tab.
export const getCardLink = (url) => {
  if (!isString(url) || !url.trim()) return null;
  const href = url.trim();
  const internal = isInternalURL(href);
  return {
    href: internal ? flattenToAppURL(href) : href,
    external: !internal,
  };
};

// -- slate ------------------------------------------------------------------
// Same contract as the statistic block: a slate field may hold a node list, a
// plain string (the value the editor starts from) or nothing at all.
export const createParagraph = (text) => ({
  type: config.settings?.slate?.defaultBlockType || 'paragraph',
  children: [{ text }],
});

const isValidNodesArray = (value) => isArray(value) && Node.isNodeList(value);

export const serializeToNodes = (value) => {
  if (isValidNodesArray(value)) return value;
  if (isString(value)) return [createParagraph(value)];
  return [createParagraph('')];
};

export const hasSlateContent = (value) => {
  if (!value) return false;
  if (isString(value)) return value.trim().length > 0;
  return serializeToNodes(value).some((node) =>
    node.children?.some((child) => child.text?.trim()),
  );
};

export const renderSlate = (value) => _serializeNodes(serializeToNodes(value));

const paragraphType = () =>
  config.settings?.slate?.defaultBlockType || 'paragraph';

const isParagraphElement = (element) =>
  React.isValidElement(element) &&
  [paragraphType(), 'p'].includes(element.props?.element?.type);

/**
 * Renders a slate value without its block wrapper, for fields that live inside
 * a heading: an `<h3>` may only contain phrasing content, so the paragraph the
 * editor produces is unwrapped instead of being nested in the heading. Multiple
 * paragraphs are joined with a space.
 */
export const renderSlateInline = (value) => {
  const elements = _serializeNodes(serializeToNodes(value));
  const inline = [];

  elements.forEach((element, index) => {
    if (!isParagraphElement(element)) {
      inline.push(element);
      return;
    }
    if (index > 0) inline.push(' ');
    inline.push(...React.Children.toArray(element.props.children));
  });

  return inline;
};

// Volto's slate widget treats an *empty array* as a valid value and hands it
// straight to Slate, which normalizes it back into a paragraph on every render.
// That round trip never settles, so the sidebar dies with "Maximum update depth
// exceeded" (React). An unset field (undefined) is fine, so empty node lists are
// dropped instead of being written to the block data.
const SLATE_FIELDS = ['title', 'description', 'text', 'info'];

const hasEmptySlateValue = (item) =>
  SLATE_FIELDS.some((field) => isArray(item[field]) && !item[field].length);

const stripEmptySlateValues = (item) => {
  const cleaned = { ...item };
  SLATE_FIELDS.forEach((field) => {
    if (isArray(cleaned[field]) && !cleaned[field].length)
      delete cleaned[field];
  });
  return cleaned;
};

/**
 * Heals block data written before the empty-array trap was understood: an empty
 * slate field is removed so the sidebar widget falls back to `undefined`.
 * Returns the original array when there is nothing to heal.
 */
export const normalizeGroups = (groups) => {
  if (!isArray(groups)) return groups;

  let changed = false;
  const normalized = groups.map((group) => {
    const cards = isArray(group.cards) ? group.cards : [];
    const cardsChanged = cards.some(hasEmptySlateValue);
    if (!hasEmptySlateValue(group) && !cardsChanged) return group;

    changed = true;
    const cleaned = stripEmptySlateValues(group);
    if (cardsChanged) cleaned.cards = cards.map(stripEmptySlateValues);
    return cleaned;
  });

  return changed ? normalized : groups;
};
