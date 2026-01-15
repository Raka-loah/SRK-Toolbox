/**
 * Strip UDP header tests.
 *
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Strip UDP header: No payload",
        input: "8111003500000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除UDP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip UDP header: Payload",
        input: "8111003500080000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除UDP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip UDP header: Input length less than header length",
        input: "81110035000000",
        expectedOutput: "UDP标头长度至少8字节",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除UDP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    }
]);
