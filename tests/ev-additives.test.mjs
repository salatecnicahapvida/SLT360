import test from 'node:test';
import assert from 'node:assert/strict';
import {evAdditiveSummary} from '../src/ev-additives.js';

test('counts SICs in all disciplines once and preserves negative amounts and cents',()=>{
 const items=[
  {description:'Obra',disciplineId:'estruturas',value:1000},
  {description:'ADITIVO 01 - SIC 03',disciplineId:'sics',value:100.12},
  {description:'SIC 2 - ETE',disciplineId:'ete-eta',value:50.23},
  {description:'ADT 3 climatização',disciplineId:'climatizacao',value:20.10},
  {description:'SIC 2 - supressão',disciplineId:'ete-eta',value:-10.20},
  {description:'Taxa de risco SIC',disciplineId:'taxa-risco',value:5},
 ];
 const result=evAdditiveSummary({total:1165.25,disciplines:{sics:100.12}},items);
 assert.equal(result.total,160.25);
 assert.equal(result.original,1005);
 assert.equal(result.included.length,4);
 assert.ok(Math.abs(result.percentage-(160.25/1005*100))<Number.EPSILON);
 assert.equal(result.exceedsLimit,true);
});
test('detailed zero overrides stale aggregate, ordinary words are not SICs',()=>{
 const result=evAdditiveSummary({total:123,disciplines:{sics:90}},[{description:'Físico básico',value:123}]);
 assert.equal(result.total,0);assert.equal(result.original,123);
 assert.equal(result.percentage,0);assert.equal(result.exceedsLimit,false);
});
test('flags only percentages strictly above five percent',()=>{
 const atLimit=evAdditiveSummary({total:1050,disciplines:{sics:50}},[]);
 assert.equal(atLimit.percentage,5);
 assert.equal(atLimit.exceedsLimit,false);
 const aboveLimit=evAdditiveSummary({total:1050.01,disciplines:{sics:50.01}},[]);
 assert.ok(aboveLimit.percentage>5);
 assert.equal(aboveLimit.exceedsLimit,true);
});
