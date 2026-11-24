import schema from './schema';

const fieldsOf = (itemSchema, fieldsetId) =>
  itemSchema.fieldsets.find((fieldset) => fieldset.id === fieldsetId).fields;

describe('FactsheetsDescriptorsBlock schema', () => {
  it('stores the descriptor groups in an object list', () => {
    expect(schema.properties.groups.widget).toBe('object_list');
    expect(schema.fieldsets[0].fields).toEqual(['groups']);
  });

  it('only keeps the cards fieldset on a group', () => {
    const groupSchema = schema.properties.groups.schema;

    expect(fieldsOf(groupSchema, 'default')).toEqual(['cards']);
    expect(Object.keys(groupSchema.properties)).toEqual(['cards']);
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
    const cardSchema = schema.properties.groups.schema.properties.cards.schema;

    expect(cardSchema.properties.icon.widget).toBe('factsheet_icon');
  });

  it('uses rich text for the card title and both text slots', () => {
    const cardSchema = schema.properties.groups.schema.properties.cards.schema;

    expect(cardSchema.properties.title.widget).toBe('slate_richtext');
    expect(cardSchema.properties.text.widget).toBe('slate_richtext');
    expect(cardSchema.properties.info.widget).toBe('slate_richtext');
  });

  it('defaults the card background to white', () => {
    const cardSchema = schema.properties.groups.schema.properties.cards.schema;

    expect(cardSchema.properties.background_color.default).toBe('#FFFFFF');
  });
});
