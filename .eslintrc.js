module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
    'jest': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    'React': 'writable'
  },
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
      'arrowFunctions': true
    },
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'babel',
    'jest'
  ],
  'settings': {
    'react': {
      'version': 'detect'
    }
  },
  'rules': {
    'no-invalid-this': 0,
    'babel/no-invalid-this': 1,
    'react/react-in-jsx-scope': 'off',
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ]
  }
}