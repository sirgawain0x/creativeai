export declare const dynamicImport: (specifier: string) => Promise<any>;
export declare const registerDynamicImport: (specifier: string, module: any) => void;
/**
 * Handles importing of plugins asynchronously.
 *
 * @param {string[]} plugins - An array of strings representing the plugins to import.
 * @returns {Promise<Function[]>} - A Promise that resolves to an array of imported plugins functions.
 */
export declare function handlePluginImporting(plugins: string[]): Promise<any[]>;
//# sourceMappingURL=import.d.ts.map
