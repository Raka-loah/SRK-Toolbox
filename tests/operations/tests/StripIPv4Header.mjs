/**
 * Strip IPv4 header tests.
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
        name: "Strip IPv4 header: No options, No payload",
        input: "450000140005400080060000c0a80001c0a80002",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: No options, Payload",
        input: "450000140005400080060000c0a80001c0a80002ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Options, No payload",
        input: "460000140005400080060000c0a80001c0a8000207000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Options, Payload",
        input: "460000140005400080060000c0a80001c0a8000207000000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Input length lesss than minimum header length",
        input: "450000140005400080060000c0a80001c0a800",
        expectedOutput: "输入长度小于IPv4标头最小长度",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    },
    {
        name: "Strip IPv4 header: Input length less than IHL",
        input: "460000140005400080060000c0a80001c0a80000",
        expectedOutput: "输入长度小于IHL",
        recipeConfig: [
            {
                op: "十六进制转字符",
                args: ["无"]
            },
            {
                op: "移除IPv4标头",
                args: [],
            },
            {
                op: "字符转十六进制",
                args: ["无", 0]
            }
        ]
    }
]);
