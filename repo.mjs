import { createRequire } from "module";
const require = createRequire(import.meta.url);

import {ESLint} from "eslint";
import * as path from "path";

// CD into userDir to simulate a user running our application from inside of their own project folder
process.chdir(path.resolve('userDir'));

const miscBaseConfig = {
    rules: {
        "array-callback-return": ["error"],
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    }
};

const eslint1 = new ESLint({
    baseConfig: miscBaseConfig,
    overrideConfigFile: path.resolve('.eslintrc.json') // Manually doing what I expected useEslintrc: true to do.
});
const expectedResultText = await getResultText(eslint1);

const eslint2 = new ESLint({
    baseConfig: miscBaseConfig,
    useEslintrc: true // This is default
});
const actualResultText = await getResultText(eslint2);

const bar = '========================================\n';
console.log(`${bar} EXPECTED RESULTS:\n${bar}${expectedResultText}\n\n`)
console.log(`${bar} ACTUAL RESULTS:\n${bar}${actualResultText}`);

async function getResultText(eslint) {
    let text = '';

    // This will give me the metadata for the rules from all the plugins
    const ruleMap = getAllRuleModules(eslint);
    text += "[METADATA FOR A STANDARD RULE]:\n";
    text += toString(ruleMap.get("no-useless-backreference"))
    text += "[METADATA FOR A USER'S PLUGIN RULE]:\n";
    text += toString(ruleMap.get("dummy/my-rule-1"))

    // The conf gives me the status of the rules that will run
    text += "\n[RULE STATUS INFORMATION]:\n"
    const conf = await eslint.calculateConfigForFile(path.resolve("dummyUserFile.js"));
    text += JSON.stringify(conf,null,2) + "\n";
    return text;
}

// THIS SEEMS LIKE THE ONLY WAY TO GET THE METADATA FROM THE RULES
function getAllRuleModules(eslint) {
    const legacyESLintModule = path.resolve(path.dirname(require.resolve('eslint')),'eslint','eslint.js');
    return require(legacyESLintModule).getESLintPrivateMembers(eslint).cliEngine.getRules();
}

function toString(obj) {
    return JSON.stringify(obj, null, 2) + "\n";
}