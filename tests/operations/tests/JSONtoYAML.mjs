/**
 * YAML tests.
 *
 * @author ccarpo [ccarpo@gmx.net]
 *
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXAMPLE_YAML = `number: 3\nplain: string\nblock: |\n  two\n  lines`;
const EXAMPLE_JSON = `{ "number": 3, "plain": "string" }`;

TestRegister.addTests([
    {
        name: "YAML to JSON",
        input: EXAMPLE_YAML,
        expectedOutput: JSON.stringify({
            "number": 3,
            "plain": "string",
            "block": "two\nlines\n"
        }, null, 4),
        recipeConfig: [
            {
                op: "YAML转JSON",
                args: [],
            }
        ],
    },
    {
        name: "JSON to YAML",
        input: EXAMPLE_JSON,
        expectedOutput: `number: 3\nplain: string\n`,
        recipeConfig: [
            {
                op: "JSON转YAML",
                args: [],
            }
        ],
    },
]);
