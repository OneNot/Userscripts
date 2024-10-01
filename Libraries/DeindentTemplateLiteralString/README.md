# A simple library that exports a simple function that can be passed a template literal. It strips code indentation from it while preserving intended indentation, by stripping out the smallest indent every line has in common.
### Usage Example:
```
function SomeFunctionThatCausesInnerCodeTobeIndented() {
  const multilineTemplateLiteralString = Deindent(`
    Some text that has been indented for code readabilty,
    but the indentatation shouldn't be passed on to the actual string.
      Except this indentation (in relation to the previous lines) should be preserved in the string,
      and it will be, because it's more indented than the baseline indentation of the string.     
  `);
  console.log(multilineTemplateLiteralString);
}
```
This function would print:
```
Some text that has been indented for code readabilty,
but the indentatation shouldn't be passed on to the actual string.
  Except this indentation (in relation to the previous lines) should be preserved in the string,
  and it will be, because it's more indented than the baseline indentation of the string.
```
