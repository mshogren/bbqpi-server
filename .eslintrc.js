module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "airbnb-base",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "ecmaFeatures": {
      "impliedStrict": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
  ],
  "rules": {
    "no-console": "off",
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
