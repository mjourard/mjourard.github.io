function supportsImports() {
    return 'import' in document.createElement('link');
}

if (supportsImports()) {
    // Good to go!
    console.log("good to go with rel links!");
} else {
    // Use other libraries/require systems to load files.
    console.log("Use other libraries/require systems to load files.");
}