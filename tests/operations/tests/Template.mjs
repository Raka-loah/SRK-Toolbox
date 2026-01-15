/**
 * @author kendallgoto [k@kgo.to]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 *
 * Modified by Raka-loah@github for zh-CN i18n
 */

import TestRegister from "../../lib/TestRegister.mjs";
TestRegister.addTests([
    {
        "name": "Template: Simple Print",
        "input": "{}",
        "expectedOutput": "Hello, world!",
        "recipeConfig": [
            {
                "op": "模板渲染",
                "args": ["Hello, world!"]
            }
        ]
    },
    {
        "name": "Template: Print Basic Variables",
        "input": "{\"one\": 1, \"two\": 2}",
        "expectedOutput": "1 2",
        "recipeConfig": [
            {
                "op": "模板渲染",
                "args": ["{{ one }} {{ two }}"]
            }
        ]
    },
    {
        "name": "Template: Partials",
        "input": "{\"users\":[{\"name\":\"Someone\",\"age\":25},{\"name\":\"Someone Else\",\"age\":32}]}",
        "expectedOutput": "Name: Someone\nAge: 25\n\nName: Someone Else\nAge: 32\n\n",
        "recipeConfig": [
            {
                "op": "模板渲染",
                "args": ["{{#*inline \"user\"}}\nName: {{ name }}\nAge: {{ age }}\n{{/inline}}\n{{#each users}}\n{{> user}}\n\n{{/each}}"]
            }
        ]
    },
    {
        "name": "Template: Disallow XSS",
        "input": "{\"test\": \"<script></script>\"}",
        "expectedOutput": "<script></script>&lt;script&gt;&lt;/script&gt;",
        "recipeConfig": [
            {
                "op": "模板渲染",
                "args": ["<script></script>{{ test }}"]
            }
        ]
    }
]);
