import schema from './schema';

const fieldsOf = (itemSchema, fieldsetId) =>
  itemSchema.fieldsets.find((fieldset) => fieldset.id === fieldsetId).fields;

describe('FactsheetsDescriptorsBlock schema', () => {
  it('stores the descriptor groups in an object list', () => {
    expect(schema.properties.groups.widget).toBe('object_list');
    expect(schema.fieldsets[0].fields).toEqual(['groups']);
  });

  it('describes the main card with an icon, title, description and colour', () => {
    const groupSchema = schema.properties.groups.schema;

    expect(fieldsOf(groupSchema, 'default')).toEqual([
      'icon',
      'title',
      'description',
      'background_color',
      'cards',
    ]);
    expect(groupSchema.properties.icon.widget).toBe('factsheet_icon');
    expect(groupSchema.properties.title.widget).toBe('slate_richtext');
    expect(groupSchema.properties.description.widget).toBe('slate_richtext');
    expect(groupSchema.properties.background_color.widget).toBe(
      'style_simple_color',
    );
    expect(groupSchema.properties.background_color.available_colors).toContain(
      '#004B7F',
    );
  });

  it('nests the descriptor cards as their own object list', () => {
    const groupSchema = schema.properties.groups.schema;
    const cards = groupSchema.properties.cards;

    expect(cards.widget).toBe('object_list');
    expect(fieldsOf(cards.schema, 'default')).toEqual([
      'icon',
      'title',
      'text',
      'info',
      'url',
      'background_color',
    ]);
  });

  it('lets the editor set a link for each card', () => {
    const cardSchema = schema.properties.groups.schema.properties.cards.schema;

    expect(cardSchema.properties.url.widget).toBe('url');
  });

  it('uses the icon widget that can clear a picked icon', () => {
    const groupSchema = schema.properties.groups.schema;
    const cardSchema = groupSchema.properties.cards.schema;

    expect(groupSchema.properties.icon.widget).toBe('factsheet_icon');
    expect(cardSchema.properties.icon.widget).toBe('factsheet_icon');
  });

  it('uses rich text for the titles and both card text slots', () => {
    const cardSchema = schema.properties.groups.schema.properties.cards.schema;
    const groupSchema = schema.properties.groups.schema;

    expect(groupSchema.properties.title.widget).toBe('slate_richtext');
    expect(cardSchema.properties.title.widget).toBe('slate_richtext');
    expect(cardSchema.properties.text.widget).toBe('slate_richtext');
    expect(cardSchema.properties.info.widget).toBe('slate_richtext');
  });

  it('defaults the backgrounds to the EEA marine blue and white', () => {
    const groupSchema = schema.properties.groups.schema;
    const cardSchema = groupSchema.properties.cards.schema;

    expect(groupSchema.properties.background_color.default).toBe('#004B7F');
    expect(cardSchema.properties.background_color.default).toBe('#FFFFFF');
  });
});
