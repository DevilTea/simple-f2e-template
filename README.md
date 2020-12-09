# Simple Multipage Frontend Project Template

A zero config simple multipage f2e project template. Design for beginner's homework 😜.

> This template is just for the small scope development of multi-page f2e project.

## Features
- Webpack 4: Bundler
- EJS: HTML template engine
- SCSS: CSS pre-processor
- PostCSS: CSS post-processor
- Tailwind CSS: Configurabale utility-first CSS framework
- Esbuild: Extremely fast JavaScript transpiler/minifier

## Usage
```bash
# Clone the repo
$ git clone https://github.com/DevilTea/simple-f2e-template.git

# Move into the repo
$ cd simple-f2e-template

# Install dependencies
$ npm install

# After finishing setup your project
# Run the development script
$ npm run dev

# Run the production building script
$ npm run build

# Create a new page if you want
# Support recursive page by naming splitted '/'
$ npm run new
✔ What is the new page name?  example/waa
New page 'example/waa' created
```

## Structure
```bash
# A valid structure would be like
└── (named folder)/
    ├── data.json # (Required) The data would be import into this level's index.ejs
    ├── public/ # All of the files and directories will keep original structure and copy into 'dist' folder
    │   └── .gitkeep
    │
    ├── templates/
    │   └── index.ejs # (Required) Entry point of ejs
    ├── scss/
    │   └── index.scss # (Required) Entry point of scss
    └── scripts/
        └── index.js # (Required) Entry point of js


# Example project structure
├── src/
│   ├── build/ # Files related with building process, think twice before you modify them
│   ├── global/ # Global resources' folder, it should extend the mentioned structure
│   └── pages/ # The pages resources' folder, the children folders could be a recursive structure but should extend the mentioned structure
│       └── index/ # Should extend the mentioned structure
│       └── example/ # Should extend the mentioned structure
│           └── pages/ # (Optional) Same as the ancestor 'pages'
│               └── waa/ # Should extend the mentioned structure
├── dist/ # The result after building, for example:
│   ├── ... # Any files, folders that you put in 'public'
│   ├── index.html
│   ├── example.html
│   └── example/
│       └── example.html
└ ... # A lot of config files, you could just ignore most of them
```

## Config
```js
// project.config.js
module.export = {
    // For example, if you are going to host the repo on gh-pages, you should modify this value to '/<repo-name>/' to have the correct result for bundled resources
    publicPath: '/'
}
```

## License
[MIT](./LICENSE)
