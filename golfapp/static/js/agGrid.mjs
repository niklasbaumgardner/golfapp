import {
  ModuleRegistry,
  ColumnAutoSizeModule,
  RowAutoHeightModule,
  RowStyleModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ClientSideRowModelModule,
  createGrid,
  colorSchemeDark,
  colorSchemeLight,
  themeAlpine,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ColumnAutoSizeModule,
  RowAutoHeightModule,
  RowStyleModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ClientSideRowModelModule,
]);

export { createGrid, colorSchemeDark, colorSchemeLight, themeAlpine };
