import { slateBeforeEach, slateAfterEach } from '../support/e2e';

describe('Blocks Tests', () => {
  beforeEach(slateBeforeEach);
  afterEach(slateAfterEach);

  // it('Add Block: Empty', () => {
  //   // Change page title
  //   cy.get('.documentFirstHeading > .public-DraftStyleDefault-block')
  //     .clear()
  //     .type('My Add-on Page')
  //     .get('.documentFirstHeading span[data-text]')
  //     .contains('My Add-on Page');

  //   cy.get('.documentFirstHeading > .public-DraftStyleDefault-block').type(
  //     '{enter}',
  //   );

  //   // Add block
  //   cy.get('.ui.basic.icon.button.quanta-block-add-button').first().click();
  //   cy.get('.blocks-chooser .title').contains('Media').click();
  //   cy.get('.content.active.media .button.image').contains('Image').click();

  //   // Save
  //   cy.get('#toolbar-save').click();
  //   cy.url().should('eq', Cypress.config().baseUrl + '/cypress/my-page');

  //   // then the page view should contain our changes
  //   cy.contains('My Add-on Page');
  //   cy.get('.block.image');
  // });
});
