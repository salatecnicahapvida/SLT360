// Limited spreadsheet arithmetic; no eval/Function and no access to identifiers.
export function arithmetic(expression) {
  const text=String(expression).replace(/^=/,'').replace(/\s/g,'');
  if(!text || text.length>256 || /[^\d.+*/()\-]/.test(text))return null;
  let index=0;
  function primary(){
    if(text[index]==='+'){index++;return primary();}
    if(text[index]==='-'){index++;return -primary();}
    if(text[index]==='('){index++;const value=sum();if(text[index++]!==')')throw new Error();return value;}
    const match=text.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if(!match)throw new Error();index+=match[0].length;return Number(match[0]);
  }
  function product(){let value=primary();while(text[index]==='*'||text[index]==='/'){const op=text[index++],next=primary();value=op==='*'?value*next:value/next;}return value;}
  function sum(){let value=product();while(text[index]==='+'||text[index]==='-'){const op=text[index++],next=product();value=op==='+'?value+next:value-next;}return value;}
  try{const result=sum();return index===text.length&&Number.isFinite(result)?result:null;}catch{return null;}
}
