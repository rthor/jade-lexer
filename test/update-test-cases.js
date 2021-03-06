'use strict';

var fs = require('fs');
var assert = require('assert');
var lex = require('../');

var dir = __dirname + '/cases/';
fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.jade$/.test(testCase)) {
    var expected;
    try {
      expected = fs.readFileSync(dir + testCase.replace(/\.jade$/, '.expected.json'), 'utf8')
                     .split(/\n/).map(JSON.parse);
    } catch (ex) {
      if (ex.code !== 'ENOENT') throw ex;
      expected = null;
    }
    var result = lex(fs.readFileSync(dir + testCase, 'utf8'), __dirname + '/cases/' + testCase);
    try {
      assert.deepEqual(expected, result);
    } catch (ex) {
      console.log('Updating ' + testCase);
      fs.writeFileSync(dir + testCase.replace(/\.jade$/, '.expected.json'),
                       result.map(JSON.stringify).join('\n'));
    }
  }
});

var edir = __dirname + '/errors/';
fs.readdirSync(edir).forEach(function (testCase) {
  if (/\.jade$/.test(testCase)) {
    var expected;
    try {
      expected = JSON.parse(fs.readFileSync(edir + testCase.replace(/\.jade$/, '.json'), 'utf8'));
    } catch (ex) {
      if (ex.code !== 'ENOENT') throw ex;
      expected = null;
    }
    var actual;
    try {
      lex(fs.readFileSync(edir + testCase, 'utf8'), edir + testCase);
      throw new Error('Expected ' + testCase + ' to throw an exception.');
    } catch (ex) {
      if (!ex || !ex.code || !ex.code.indexOf('JADE:') === 0) throw ex;
      actual = {
        msg: ex.msg,
        code: ex.code,
        line: ex.line
      };
    }
    try {
      assert.deepEqual(expected, actual);
    } catch (ex) {
      console.log('Updating ' + testCase);
      fs.writeFileSync(edir + testCase.replace(/\.jade$/, '.json'),
                      JSON.stringify(actual, null, '  '));
    }
  }
});
