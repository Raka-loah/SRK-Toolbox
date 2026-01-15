/**
 * URLEncode and URLDecode tests.
 *
 * @author es45411 [135977478+es45411@users.noreply.github.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // URL Decode
    {
        name: "URLDecode: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "URL解码",
                args: [],
            },
        ],
    },
    {
        name: "URLDecode: spaces without special chars",
        input: "Hello%20world%21",
        expectedOutput: "Hello world!",
        recipeConfig: [
            {
                op: "URL解码",
                args: [],
            },
        ],
    },
    {
        name: "URLDecode: spaces with special chars",
        input: "Hello%20world!",
        expectedOutput: "Hello world!",
        recipeConfig: [
            {
                op: "URL解码",
                args: [],
            },
        ],
    },
    {
        name: "URLDecode: decode plus as space",
        input: "Hello%20world!",
        expectedOutput: "Hello world!",
        recipeConfig: [
            {
                op: "URL解码",
                args: [],
            },
        ],
    },
    // URL Encode
    {
        name: "URLEncode: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "URL编码",
                args: [],
            },
        ],
    },
    {
        name: "URLEncode: spaces without special chars",
        input: "Hello world!",
        expectedOutput: "Hello%20world!",
        recipeConfig: [
            {
                op: "URL编码",
                args: [],
            },
        ],
    },
    {
        name: "URLEncode: spaces with special chars",
        input: "Hello world!",
        expectedOutput: "Hello%20world%21",
        recipeConfig: [
            {
                op: "URL编码",
                args: [true],
            },
        ],
    },
]);
