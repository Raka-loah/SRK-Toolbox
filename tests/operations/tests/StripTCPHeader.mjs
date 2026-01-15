/**
 * Strip TCP header tests.
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
        name: "Strip TCP header: No options, No payload",
        input: "7f900050000fa4b2000cb2a45010bff100000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: No options, Payload",
        input: "7f900050000fa4b2000cb2a45010bff100000000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Options, No payload",
        input: "7f900050000fa4b2000cb2a47010bff100000000020405b404020000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Options, Payload",
        input: "7f900050000fa4b2000cb2a47010bff100000000020405b404020000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Input length less than minimum header length",
        input: "7f900050000fa4b2000cb2a45010bff1000000",
        expectedOutput: "TCP标头长度至少20字节",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip TCP header: Input length less than data offset",
        input: "7f900050000fa4b2000cb2a47010bff100000000",
        expectedOutput: "输入长度小于数据偏移量",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除TCP标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    }
]);
