import globals from 'globals';
export default [{
  files:['src/**/*.js','scripts/**/*.mjs','tests/**/*.mjs','tests/**/*.js'],
  languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:{...globals.browser,...globals.node,echarts:'readonly',Chart:'readonly'}},
  rules:{'no-undef':'error','no-dupe-args':'error','no-dupe-keys':'error','no-duplicate-case':'error','no-unreachable':'error','no-constant-condition':['error',{checkLoops:false}]},
}];
