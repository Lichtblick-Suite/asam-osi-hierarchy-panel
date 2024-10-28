# ASAM OSI Hierarchy Panel extension for Lichtblick

## What is this extension about?

This is a custom extension for Lichtblick that enables to add a panel showing the Ground Truth Hierarchy data in a tree view.

## Getting started

Get Lichtblick from [github](https://github.com/Lichtblick-Suite/lichtblick/releases).

Get extension file from [releases](https://github.com/Lichtblick-Suite/asam-osi-hierarchy-panel/releases).

Install the extension in Lichtblick by dragging the `.foxe` file into the Lichtblick window.

Open a file/stream which is following the ASAM OSI standard.

## Coding guidelines

The code should follow the coding guidelines of Lichtblick. This includes the usage of typescript, prettier, eslint and the lichtblick-suite sdk.

## Develop

Extension development uses the `yarn` package manager to install development dependencies and run build scripts.

To install extension dependencies, run `yarn` from the root of the extension package.

```sh
yarn install
```

To build and install the extension into your local Foxglove desktop app, run:

```sh
yarn run local-install
```

Open the Foxglove desktop (or `ctrl-R` to refresh if it is already open). Your extension is installed and available within the app.

## Package

Extensions are packaged into `.foxe` files. These files contain the metadata (package.json) and the build code for the extension.

Before packaging, make sure to set `name`, `publisher`, `version`, and `description` fields in _package.json_. When ready to distribute the extension, run:

```sh
yarn run package
```

This command will package the extension into a `.foxe` file in the local directory.
