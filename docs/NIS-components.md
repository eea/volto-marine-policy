# Non-indigenous species (NIS) components — research notes

Research on the two NIS components in this addon:

- `src/components/theme/NISListingView/` — the NIS **table listing** (a Volto `listing` block variation)
- `src/components/theme/NISMetadataSectionTableView/` — the NIS **record detail** view (a `metadataSection` block variation)

**Path conventions used below:** frontend paths are relative to this addon root (`volto-marine-policy/`); backend paths are relative to the `water-p5` repo root (one level above `marine-frontend/`). Every claim cites the source that owns it.

---

## 1. What NIS is in this system

NIS = **Non-indigenous species** under the EU MSFD (Marine Strategy Framework Directive) reporting (Descriptor D2). In WISE-Marine, each NIS record is a Plone content item of type `non_indigenous_species`, created/edited by national experts and reviewed/published by EEA reviewers.

Primary sources:
- Content type FTI: `src/wise.msfd/src/wise/msfd/profiles/upgrades/to_3/types/non_indigenous_species.xml` (title "Non-indigenous species", klass `wise.msfd.nis.NonIndigenousSpeciesContent`, behaviors `plone.dublincore`, `plone.namefromtitle`, `volto.blocks.fixed.layout`, `eea.coremetadata.behavior`)
- Workflow binding: `src/wise.msfd/src/wise/msfd/profiles/default/workflows.xml:109` binds `non_indigenous_species` → `nis_workflow`
- Backend module: `src/wise.msfd/src/wise/msfd/nis.py`

---

## 2. Component registration

Both components are registered in `src/index.js` of this addon (the `applyConfig` function):

| Component | Registered as | Details |
|---|---|---|
| `NISListingView` | `config.blocks.blocksConfig.listing.variations` entry `{ id: 'nis', title: 'NIS Table', template: NISListingView }` | `src/index.js` (~line 157–163) |
| `NISMetadataSectionTableView` | `config.blocks.blocksConfig.metadataSection.variations` entry `{ id: 'nis_table', title: 'NIS Table', view: NISMetadataSectionTableView, schemaEnhancer: addTableField }` | `src/index.js` (~line 166–172) |

Both are re-exported from `src/components/index.js` (lines 17–18) and `src/index.js` (lines 8–9).

- The `listing` variation means a page author drops a **Listing block**, picks "NIS Table", and the block's search results (`items`) render as the NIS management table.
- The `metadataSection` variation means a page author drops a **Metadata Section block** (from `@eeacms/volto-metadata-block`), picks "NIS Table", and the block renders the current content object's metadata fields as a two-column table. `addTableField` (schemaEnhancer) adds a "Table style" fieldset (`table` object property, `TableSchema` from the metadata block) so editors can style the table — see `node_modules/@eeacms/volto-metadata-block/src/components/manage/Blocks/MetadataSection/variations.js`.
- The NIS record detail page layout (a group block containing a `metadataSection` block with `"variation": "nis_table"` and fields `nis_species_name_original`, `nis_species_name_accepted`, `nis_scientificname_accepted`, `nis_region`, …) was captured in `water-p5/nis_blocks_layout.json`.

---

## 3. `NISListingView` — the management table

File: `src/components/theme/NISListingView/NISListingView.jsx` (650 lines), styles in `style.less`, tests in `NISListingView.test.jsx`.

### 3.1 Props and data source

- Props: `items` (required, array), `isEditMode` (bool). **`isEditMode` is destructured but never used** (`NISListingView.jsx:99`).
- `items` come from the hosting listing block's `@querystring-search` results; the component additionally re-queries the current search itself in two places (see 3.4).
- Store access: `state.actions.actions` (to compute `canEditPage = actions.object.some(a => a.id === 'edit')`), `state.userSession.token` (JWT, decoded with `jwt-decode` to get `sub` = current user id).
- The `useEffect` at the top patches `window.history.pushState/replaceState` and listens to `popstate`, bumping a `locationTick` counter so the duplicates check re-runs on SPA navigation (`NISListingView.jsx:203–228`).

### 3.2 Table columns

11 columns (`<thead>` at `NISListingView.jsx:470–485`), fed directly from item metadata fields:

| Header | Item field |
|---|---|
| Species name original | `nis_species_name_original` |
| Species name accepted | `nis_species_name_accepted` |
| Scientific name accepted | `nis_scientificname_accepted` |
| Region | `nis_region` |
| Subregion | `nis_subregion` |
| Country | `nis_country` |
| Status | `nis_status` |
| Group | `nis_group` |
| Year | `nis_year` |
| Assigned to | `nis_assigned_to` (formatted, see 3.5) + selection checkbox (only if `canEditPage`) |
| (actions) | View / Edit / Copy / Remove + `ProgressWorkflow` (see 3.6) |

### 3.3 Per-row actions and access control

- **View** — always shown; `UniversalLink` to `item['@id']`, opens in new tab.
- **Edit, Copy, Remove** — shown **only if the item is assigned to the current user** (`isAssignedToMe(item, currentUserId)`, `NISListingView.jsx:91–96`), i.e. the backend has granted the user the local `Editor` role on that item (see 4.3).
- **Copy** — POST `${apiPath}/++api++${item['@id'] minus /marine prefix}/@copy-nis-record` (`NISListingView.jsx:165–186`). On failure shows a red error box.
- **Remove** — `window.confirm('Are you sure you want to remove this item?')` then DELETE `++api++{item['@id'] minus /marine}` (`NISListingView.jsx:188–212`). On failure shows a red error box. Both reload the page on success.
- Path handling quirk: the frontend site lives under `/marine`, but the Plone objects live at the root of a virtual host, so **every API URL strips the leading `/marine`** from `item['@id']` or `window.location.pathname` (e.g. `NISListingView.jsx:142–144`, `171–173`).

### 3.4 Admin toolbar (visible only when `canEditPage` and not in duplicates mode)

Four buttons (`NISListingView.jsx:405–448`):

1. **Add NIS record** — link to `${pathname}/add?type=non_indigenous_species` (new-tab).
2. **Check duplicates** — sets `check-duplicates=1` in the URL query and reloads. On mount with that param, POSTs `${pathname minus /marine}/@check-nis-duplicates` with body `{ search: window.location.search }` (`NISListingView.jsx:230–267`).
3. **Assign search results** — `handleBulkAssignAll`: re-runs the current search via `@querystring-search` POST (payload built by `getCurrentSearchItems`, see below), stores `items_total`, selects `['All']`.
4. **Download search results** — plain `<a>` to `/marine/++api++${pathname minus /marine}/nis-export${window.location.search}` (`NISListingView.jsx:436–444`). This hits the Volto **express middleware** (see 3.7).

`getCurrentSearchItems` (`NISListingView.jsx:28–62`): parses `window.location.search`, JSON-decodes the `query` param (normalizing operator names), and POSTs to `${apiPath}/++api++/@querystring-search` with `metadata_fields: '_all'`, `b_size` (default 25), `limit` (default 3000), `sort_on` (default `effective`), `sort_order` (default `ascending`), `b_start` (default 0).

### 3.5 Bulk assignment ("Assign to expert")

- Selecting any checkbox reveals a fixed floating panel (`.users-assign-container`) with an expert `<Select>` and Cancel/Assign buttons (`NISListingView.jsx:591–630`).
- Experts are fetched once from `${apiPath}/++api++/@vocabularies/nis_experts_vocabulary` (`NISListingView.jsx:269–290`); each option is `{ key/value: token, text: title }`.
- **Assign** → POST `${pathname minus /marine}/@bulk-assign${location.search}` with `{ items, assigned_to, search }` (`NISListingView.jsx:139–156`). If `items === ['All']`, the backend resolves all matching records server-side. No error handling on this fetch (no try/catch — an unhandled rejection); page reloads on success.
- Display-name handling: `formatAssignedTo` (`NISListingView.jsx:76–89`) (a) decodes Python-style `\UXXXXXXXX` escapes (the vocabulary/backend stores names JSON-escaped), (b) strips the trailing ` (userid)` suffix. `isAssignedToMe` uses the same regex to extract the userid.

### 3.6 Duplicates mode

When `check-duplicates=1` is in the URL and `@check-nis-duplicates` responds:

- Yellow banner: "Showing **N** duplicate records across **M** groups" with a **Clear** link that removes the param (`NISListingView.jsx:449–468`).
- The table body is replaced by `duplicateTableRows` (`NISListingView.jsx:294–390`): each duplicate group's items (from `groups[].items`, which include `review_state`) rendered with an extra separator row between groups; row keys/actions identical to the normal rows.
- `duplicateIds` (a `Set` of normalized paths — `normalizeItemPath` strips the `apiPath` origin+prefix) gates which rows are shown.
- An injected `<style>` hides pagination elements while in duplicates mode (`NISListingView.jsx:468–478`): `.listing-pagination, .pagination-wrapper, nav[aria-label="Pagination Navigation"], .ui.pagination`.

### 3.7 `nis-export` via express middleware

`src/express-middleware.js` registers a `viewsMiddleware` (express router) matching `**/@@nis-export` (and `**/@@demo-sites-map.arcgis.json`): it fetches the backend URL with the user's auth (`getAPIResourceWithAuth`), forwards only whitelisted headers (`Accept-Ranges`, `Cache-Control`, `Content-Disposition`, `Content-Range`, `Content-Type`) plus the body. This is why the download link above works through the Volto server rather than calling the Plone backend directly.

### 3.8 Per-row `ProgressWorkflow` widget

Each row embeds `<ProgressWorkflow content={item} pathname={item['@id']} token={123} />` (`NISListingView.jsx:360–363`, 570–573). See section 5 for how it works. **Quirk: `token` is hardcoded to `123`** — it only gates `isAuth`, so the widget behaves as "logged in" for every row regardless of the real session.

### 3.9 State inventory

`isLoading`, `selectedItems`, `itemsTotal`, `duplicateIds`, `duplicateGroups`, `duplicatesLoading`, `errorMessage`, `locationTick`, `users`, `assignee` (all `useState`), plus redux: `actions`, `token`, `currentUserId`, `canEditPage` (`NISListingView.jsx:99–119`).

### 3.10 Tests (`NISListingView.test.jsx`)

Mocked: react-redux (partial), `UniversalLink`, `ProgressWorkflow`, `global.fetch` (vocabulary + duplicates endpoints), `window.location`. Coverage areas:
- table rendering (all headers, one row per item, data in correct columns, empty table)
- `formatAssignedTo` output (strips `(userid)`, decodes `\U` escapes, null → empty)
- admin controls visibility by `canEditPage` (buttons and checkboxes hidden without `edit` action)
- duplicates: banner counts, filtered table, Clear link
- selection: toggle, unselect, multi-select count
- bulk assign panel: Cancel/Assign buttons, Assign disabled without assignee, Cancel clears selection

---

## 4. Backend (`wise.msfd` package)

All NIS backend code lives in `src/wise.msfd/src/wise/msfd/nis.py` (585 lines) + `nis.zcml` (service registrations) + the FTI above. **Two branches exist side by side in the repo:**

| Checkout | Branch | Commit | Role |
|---|---|---|---|
| `water-p5/src/wise.msfd` | `plone5` | `dce29df3` | mounted into the dev backend container (`docker-compose-dev.yml:46`, `./src/wise.msfd/:/plone/instance/src/wise.msfd`) |
| `water-p5/src-p6/wise.msfd` | `develop` | `a8df2201` | newer work; **contains `@copy-nis-record` and `@check-nis-duplicates`** which the plone5 branch does NOT have |

⚠️ **Mismatch to be aware of:** the frontend calls `@copy-nis-record` and `@check-nis-duplicates` (Copy / Check duplicates features), but these services are registered only in the `develop` branch (`src-p6/.../nis.zcml:90,98`). The `plone5` branch mounted in the dev compose would answer 404 for them. The features require the develop-branch backend (the `plone6` service in `docker-compose-dev.yml` uses `laszlocseh/msfd-backend:6.1.3-2.develop`).

### 4.1 Content type

- FTI: `src/wise.msfd/src/wise/msfd/profiles/upgrades/to_3/types/non_indigenous_species.xml` — a **Dexterity FTI with an inline `model_source`** defining the `nis` fieldset:
  - Required: `nis_species_name_original`, `nis_species_name_accepted`, `nis_scientificname_accepted`
  - Choices: `nis_list` (MSFD), `nis_subregion` (10 MSFD sub-regions), `nis_region` (4 MSFD regions), `nis_status`, `nis_group`, pathway probabilities (`nis_pathway_probability_*`, values `P_HIGH`/`P_MED`/`P_LOW`), `nis_assigned_to` (vocabulary `nis_experts_vocabulary`)
  - `nis_country` is a **List** of country choices
  - Text fields: `nis_status_comment`, `nis_taxonomy`, `nis_ns_stand`, `nis_year`, `nis_period`, `nis_area`, pathway values (`nis_rel`, `nis_ec`, `nis_tc`, `nis_ts_other`, `nis_ts_ball`, `nis_ts_hull`, `nis_cor`, `nis_una`, `nis_unk`), `nis_comment`, `nis_source`, `nis_remarks`, `nis_taxon_comment`, `nis_checked_by`, `nis_check_comment`, `nis_checked_on` (Date)
  - `nis_total` (Text) — **shadowed by a class property** (see below)
- Class: `NonIndigenousSpeciesContent(Container)` (`nis.py:248–257`) implements `INonIndigenousSpeciesContent`; `nis_total` is a read-only **property** returning the computed sum of the nine pathway values.
- **Validation:** subscribers `validate_total_on_add` / `validate_total_on_edit` (`nis.py:201–211`, registered in `nis.zcml`) raise `BadRequest` if `round(sum(rel, ec, tc, ts_other, ts_ball, ts_hull, cor, una, unk), 6) != 1.0` — i.e. the pathway probabilities must sum to exactly 1 (`nis.py:213–241`).
- Field-name map for import/export: `nis_fields` dict (`nis.py:35–79`) — 33 Excel/CSV headers → `nis_*` attribute names (plone5 branch). The develop branch adds the 9 `Pathway_Probability *` headers (see 4.5).

### 4.2 Workflow (`nis_workflow`)

Definition: `src/wise.msfd/src/wise/msfd/profiles/default/workflows/nis_workflow/definition.xml`; bound in `workflows.xml:109`.

- States: `draft` (initial) → `submitted` → `approved` → `published`
- Transitions: `submit` (guarded by role **Editor**); `approve`, `publish`, `send_back_to_*` (all guarded by role **Reviewer**)
- Permissions per state:
  - `draft`: Editor can Modify/Review; Reader/Editor/Reviewer can View
  - `approved`: **Editor can no longer Modify** (only Manager/Site Administrator); Reviewer can Review; View for Editor+Reader+Reviewer
  - `published`: Anonymous can View; only Manager/Site Administrator can Modify
- Progress percentages/steps for the frontend widget are computed by `eea.progress.workflow` from this workflow (see section 5).

### 4.3 `@bulk-assign` service (`nis.py:417–567`, registered `nis.zcml:74–84`)

POST, permission `cmf.ModifyPortalContent`, CSRF disabled (`alsoProvides(IDisableCSRFProtection)`). Body `{ items, assigned_to, search }`:

1. If `items[0] === 'All'` and `search` present: catalog `unrestrictedSearchResults` over `portal_type: non_indigenous_species` with the query's `i`/`v` filters; items become the resulting absolute paths.
2. `username` is parsed from `assignee` as the trailing ` (userid)` (fallback: whole string).
3. For each path (after stripping `/marine/` prefix): `api.content.get`, `setattr(obj, 'nis_assigned_to', assignee)`, **revoke local `Editor` role from all other users**, `grant_roles(Editor)` to the new assignee on the object only, `reindexObject`.
4. Emails: to the assignee ("You have been assigned N new item(s)", sender `wise-marine@eea.europa.eu`) and to the reviewers list `extranet-wisemarine-nisreviewers@roles.eea.eionet.europa.eu` (`_notify_user`/`_notify_eea_group`, `nis.py:446–492`; `_send_email` via `api.portal.send_email` with error fallback).
5. Returns `{ success, updated, assigned_to }`.

This is the mechanism behind "Edit/Copy/Remove visible only for the assignee" (3.3): the assignee holds the object-level `Editor` role.

### 4.4 `nis_experts_vocabulary` (`nis.py:88–110`)

`IVocabularyFactory` over the group **`extranet-wisemarine-nisexternalexperts`**; each term = `"Fullname (userid)"` (falls back to userid when no fullname). The other NIS vocabularies (`nis_region_vocabulary`, `nis_subregion_vocabulary`, `nis_country_vocabulary`, `nis_group_vocabulary`) are built from `portal_catalog.uniqueValuesFor(index)` and sorted by title (`nis.py:112–195`, registered `nis.zcml:35–58`).

### 4.5 Other backend views/services

- **`nis-export`** (`NISExport`, `nis.py:321–371`, registered `nis.zcml:31–34`, permission `zope2.View`): catalog search (same filter logic as bulk-assign) → `xlsxwriter` workbook, one worksheet "Data", header row = `nis_fields` keys, one row per brain (`_unrestrictedGetObject`), filename `Marine Non Indigenous Species Data - YYYY-MM-DD.xlsx`.
- **`nis-import`** (`NonIndigenousSpeciesImportView`, `nis.py:260–320`, registered `nis.zcml:22–28`, permission `cmf.ManagePortal`, template `pt/nis-import.pt`): z3c.form with a `NamedFile` CSV field; `csv.DictReader` (utf-8-sig); per row, creates `non_indigenous_species` titled with `Species_name_original` and sets every `nis_fields` attribute; skips rows without a species name.
- **`@workflow.progress.nis`** (`WorkflowProgress`/`WorkflowProgressGet`, `nis.py:373–415`, registered `nis.zcml:62–68`): expandable element returning `{ '@id': '{url}/@workflow.progress.nis', steps, done, transitions }` via `IWorkflowProgress` adapter from `eea.progress.workflow`.
- **Develop-branch only** (`src-p6/wise.msfd/src/wise/msfd/nis.py:657–795`, registered in `src-p6/.../nis.zcml:90–103`):
  - `CopyNISRecord`: copies all `nis_fields` values except `nis_total`, title `"{title} (copy)"`, creates sibling in the same container, copies `__ac_local_roles__`, returns `{ success, @id, title }`.
  - `CheckNISDuplicates`: catalog search (with query + `SearchableText` filters), groups by `(nis_species_name_original, nis_species_name_accepted, nis_scientificname_accepted, nis_region, nis_subregion, nis_country[first], nis_year)`; groups with >1 member produce `duplicate_ids` (paths) and `groups[]` with per-item `review_state` plus the 10 display fields the frontend table needs.
  - `nis_fields` extended with the 9 `Pathway_Probability *` entries; `PERIOD_RANGES` + `set_period_from_year_on_add/edit` handlers auto-compute `nis_period` from `nis_year` in 6-year bands; `nis_total` gets a setter.

### 4.6 Related legacy bits

- `INISFields` behavior interface (`src/wise.msfd/src/wise/msfd/interfaces.py:196–…`): `nis_region`/`nis_subregion` (Text), `nis_country` (List) — a separate, older schema from the FTI model; its ZCML registration is commented out in `nis.zcml:14–22`.
- A commented-out `NISDeserializer` (path rewriting `/marine/` → `/`) sits at the bottom of `nis.py:569–585` — dead code.

---

## 5. `ProgressWorkflow` — the per-row workflow widget

File: `src/components/theme/ProgressWorkflow/ProgressWorkflow.jsx` (474 lines) — reused here per NIS row (also used in folder contents/edit views).

- Data: dispatches `getWorkflowProgress(pathname)` → action type `WORKFLOW_PROGRESS_PATH` with request GET `{item}/@workflow.progress.nis`; result stored in the addon reducer `workflowProgressPath` (`src/reducers/workflowprogress/workflow.js`, registered as `config.addonReducers.workflowProgressPath` in `src/index.js`).
- Rendering (only when `isAuth` — i.e. `token` truthy — and a current state is found):
  - a circular button showing `done` % (CSS class `review-state-{review_state}` colored via `style.less`: draft red, submitted orange, approved green)
  - the current state title
  - a `react-select` of available transitions (options from `transitions`, colored by `config.settings.workflowMapping`, plus the current state as value); choosing one dispatches Volto's `transitionWorkflow` and shows a toast
  - a reversed ordered list of progress steps (`steps` arrays `[keys, %, titles, descriptions]` from the backend)
- Click-outside handling closes the dropdown (`doesNodeContainClick`).
- Relevant NIS quirks: `token` passed as hardcoded `123` (always "authenticated"); `pathname` = item `@id` so the widget fetches the right item's progress; in a listing of many rows this means one `@workflow.progress.nis` request per row.

---

## 6. `NISMetadataSectionTableView` — the record detail table

File: `src/components/theme/NISMetadataSectionTableView/NISMetadataSectionTableView.jsx` (14 lines) + `style.less`.

- Thin wrapper: renders `<div className="nis-metadata-section-table-view"><MetadataSectionTableView {...props} /></div>`.
- `MetadataSectionTableView` (from `node_modules/@eeacms/volto-metadata-block/src/components/manage/Blocks/MetadataSection/ViewMetadataSection.jsx:91–133`): takes `{ data, properties, metadata }` (merged over the current content from redux), filters fields with `hideInView`, and renders a Semantic-UI `<Table>` (props `fixed/compact/basic/celled/inverted/striped` read from `data.table`, set by the `addTableField` schemaEnhancer — see section 2) with one row per field: `<Table.HeaderCell width={1}>{field.title}</Table.HeaderCell>` + value cell. Rows with empty values are skipped (`isEmptyWithNumberCheck`).
- The wrapper's `style.less` restyles it for NIS: header cell width 25%, blue (`#0079cf`) header borders, last-header-row no border, `.block.metadata` margin reset.

---

## 7. Data flow summary

```
┌─ NIS listing page (Listing block, variation "nis")
│   items ← block's @querystring-search (metadata_fields _all)
│
│   "Assign search results" ──POST @querystring-search (from URL query)──► items_total → ['All']
│   "Assign" (selected/All) ──POST @bulk-assign {items, assigned_to, search}──► backend: set nis_assigned_to,
│         │                                                                    grant local Editor, emails
│   "Check duplicates" ──?check-duplicates=1──► POST @check-nis-duplicates {search}──► groups/duplicate_ids
│   "Copy" ──POST @copy-nis-record──► sibling " (copy)" item
│   "Remove" ──DELETE ++api++{path}──► content deleted
│   "Download search results" ──/marine/++api++{path}/nis-export?search──► express middleware ──► xlsx
│   per row: GET @workflow.progress.nis ──► ProgressWorkflow (%, state, transitions)
│
└─ NIS record page (Metadata Section block, variation "nis_table")
        metadata fields of the content object rendered as a styled table
```

---

## 8. Notable quirks / things to be careful about

1. **Branch mismatch:** `@copy-nis-record` / `@check-nis-duplicates` exist only on the `develop` (p6) branch of `wise.msfd`; the `plone5` branch mounted in the dev compose lacks them (Copy / Check duplicates would 404). (`src-p6/.../nis.zcml:90,98` vs `src/.../nis.zcml`)
2. `isEditMode` prop of `NISListingView` is unused (`NISListingView.jsx:99,647`).
3. `ProgressWorkflow` receives hardcoded `token={123}` (`NISListingView.jsx:362,573`) — the widget always behaves as authenticated.
4. `onBulkAssign` has no try/catch — a failed fetch leaves `isLoading` forever (no reload, no error box) (`NISListingView.jsx:139–156`).
5. `/marine` prefix stripping is string-based (`replace('/marine', '')` / `replace(/^\/marine/, '')`) — fragile if paths ever change.
6. Duplicates mode hides pagination via an injected `<style>` tag and only renders duplicates; the normal "items" list is ignored while `duplicateIds` is set.
7. Backend `nis_workflow`: once `approved`, the assignee loses local Modify rights (only Manager/Site Admin can modify); the assignee's `Editor` role is what unlocks Edit/Copy/Remove in the UI.
8. The pathway probabilities must sum to exactly 1.0 (rounded to 6 decimals) or add/edit fails with `BadRequest` (`nis.py:213–241`).
9. The `nis_total` FTI field is effectively read-only in plone5 (class property, no setter); the develop branch adds a setter.

---

## 9. Sources (files cited)

Frontend (addon `volto-marine-policy/`):
- `src/components/theme/NISListingView/NISListingView.jsx`, `style.less`, `NISListingView.test.jsx`
- `src/components/theme/NISMetadataSectionTableView/NISMetadataSectionTableView.jsx`, `style.less`
- `src/components/theme/ProgressWorkflow/ProgressWorkflow.jsx`
- `src/index.js` (registration), `src/components/index.js`, `src/reducers/workflowprogress/workflow.js`
- `src/express-middleware.js` (nis-export proxy)
- `src/components/Widgets/NISStatusWidget.jsx`
- `node_modules/@eeacms/volto-metadata-block/src/components/manage/Blocks/MetadataSection/ViewMetadataSection.jsx`, `variations.js`
- `CHANGELOG.md` (feature history)

Backend (repo root `water-p5/`):
- `src/wise.msfd/src/wise/msfd/nis.py`, `nis.zcml`, `profiles/upgrades/to_3/types/non_indigenous_species.xml`, `profiles/default/workflows.xml`, `profiles/default/workflows/nis_workflow/definition.xml`, `interfaces.py`
- `src-p6/wise.msfd/src/wise/msfd/nis.py`, `nis.zcml` (develop-branch services)
- `docker-compose-dev.yml` (backend mounts, api path wiring)
- `nis_blocks_layout.json` (NIS record page block layout)
