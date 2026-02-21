# MX DevCore — VS Code Snippets

Project-level snippets for scaffolding Shopify theme files and JavaScript modules. Located at `.vscode/snippets.code-snippets`.

## Liquid / HTML

| Prefix | Description |
|---|---|
| `shop-liquid` | Liquid tag block with `section.settings` assignment |
| `shop-section` | Section markup with wrapper, container, background, and content divs |
| `shop-block` | Theme block markup with id, classname generation, and `shopify_attributes` |
| `shop-schema-s` | Section schema with name, tag, class, settings, blocks, disabled_on, and presets |
| `shop-schema-b` | Block schema with name, settings, blocks, and presets |
| `shop-module` | Inline `<script type="module">` with asset_url import and section reference |

## JavaScript

| Prefix | Description |
|---|---|
| `shop-script` | Named export arrow function |
| `shop-class` | Class with constructor and default export |
| `shop-component` | Web component extending `Component` base class with lifecycle methods |

## Usage

Type any prefix in a file with a matching scope and press `Tab` to expand.

Tab stops let you fill in placeholder values and jump between them with `Tab`. Linked placeholders (like section/block name in schemas) update together as you type.

## Snippet Details

### shop-liquid

Outputs a `{%- liquid -%}` tag with `section.settings` pre-assigned.

```liquid
{%- liquid
  assign s = section.settings

-%}
```

### shop-section

Outputs section wrapper markup with optional custom ID, background size handling, and container/content structure.

```html
<div class="section__wrapper">
  <div>
    <div class="section__container container">
      <div class="section__content content">
        <div class="section__header"></div>
        <div class="section__main"></div>
      </div>
    </div>
  </div>
</div>
```

### shop-block

Outputs a theme block with generated id, classname, and `shopify_attributes`. Includes the liquid tag for variable assignments and a capture block for the classlist.

```liquid
{%- liquid
  assign s = block.settings
  assign attrs = block.shopify_attributes
  assign prefix = 'theme-block__'
  assign type = 'block-type'
  assign unique_id = section.id | append: '--' | append: block.id
  assign id = prefix | append: unique_id
  assign classname = prefix | append: type
-%}

{%- capture classlist -%}
  theme-block {{ classname }}
{%- endcapture -%}

<div id="{{ id }}" class="{{ classlist | strip }}" {{ attrs }}>
</div>
```

### shop-schema-s

Outputs a full section schema. The `name` placeholder is linked between the top-level name and the preset name.

```json
{
  "name": "section_name",
  "tag": "section",
  "class": "section__class_name",
  "settings": [],
  "blocks": [],
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "presets": [
    {
      "name": "section_name",
      "settings": {},
      "blocks": [],
      "category": "category"
    }
  ]
}
```

### shop-schema-b

Outputs a block schema. The `name` placeholder is linked between the top-level name and the preset name.

```json
{
  "name": "Block Name",
  "tag": null,
  "settings": [],
  "blocks": [],
  "presets": [
    {
      "name": "Block Name",
      "settings": {},
      "blocks": [],
      "category": "Category"
    }
  ]
}
```

### shop-module

Outputs an inline module script that imports a class from an asset URL and instantiates it with a section reference.

```html
<script type="module">
  import ModuleName from '{{ "file_path" | asset_url }}'
  const section = document.getElementById('shopify-section-{{ section.id }}')

  const variableName = new ModuleName(section)
</script>
```

### shop-script

Outputs a named export arrow function.

```javascript
export const functionName = () => {

}
```

### shop-class

Outputs a class with a constructor and default export.

```javascript
class ClassName {
  constructor() {

  }
}

export default ClassName
```

### shop-component

Outputs a web component extending the `Component` base class with `connectedCallback` and `disconnectedCallback` lifecycle methods.

```javascript
import Component from '@js/core/component'

class ComponentName extends Component {
  constructor() {
    super()

  }

  connectedCallback() {}

  disconnectedCallback() {}
}

export default ComponentName
```