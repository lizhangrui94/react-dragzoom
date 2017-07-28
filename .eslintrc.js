module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parser": "babel-eslint",
    "extends": [
        "airbnb",
        "plugin:flowtype/recommended",
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": [
        "react",
        "jsx-a11y",
        "import",
        "flowtype"
    ],
    "rules": {
        "no-use-before-define": 0,
        "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
        "linebreak-style": ["error", "windows"],
        // "linebreak-style": ["error", "unix"],
        "max-len": ["error", 120, 4]
    }
};