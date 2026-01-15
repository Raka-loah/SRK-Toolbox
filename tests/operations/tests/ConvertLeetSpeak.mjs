/**
 * @author bartblaze []
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Convert to Leet Speak: basic text",
        input: "leet",
        expectedOutput: "l337",
        recipeConfig: [
            {
                op: "Leet Speak转换",
                args: ["Leet Speak编码"]
            }
        ]
    },
    {
        name: "Convert from Leet Speak: basic leet",
        input: "l337",
        expectedOutput: "leet",
        recipeConfig: [
            {
                op: "Leet Speak转换",
                args: ["Leet Speak解码"]
            }
        ]
    },
    {
        name: "Convert to Leet Speak: basic text, keep case",
        input: "HELLO",
        expectedOutput: "H3LL0",
        recipeConfig: [
            {
                op: "Leet Speak转换",
                args: ["Leet Speak编码"]
            }
        ]
    },
    {
        name: "Convert from Leet Speak: basic leet, keep case",
        input: "H3LL0",
        expectedOutput: "HeLLo",
        recipeConfig: [
            {
                op: "Leet Speak转换",
                args: ["Leet Speak解码"]
            }
        ]
    }
]);

