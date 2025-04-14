## Ensure Content is Personalized

When working with Contensis, it is normal to render the content fields of an Entry of a specific content type that has fields containing the content for the current "page".

```json
{
  // The non-personalized content could look like this
  "lead": "Personalization in Contensis",
  // Personalized "variants" curated with an "audiences" field
  "variants": [
    {
      // We could add a default (non-personalized) variant with the other variants
      "audiences": [],
      "lead": "Personalization in Contensis (the default variant)"
    },
    {
      "audiences": ["returningVisitors"],
      "lead": "This variant will be rendered for visitors placed in the above audience(s)"
    }
    // Add more variants...
  ]
  // ...other Entry fields
}
```

_Example Entry JSON highlighting a `lead` text field and then personalized versions of the same field in a repeatable field called `variants`_

### Repeatable Component

For the next example, our Entry will contain a Component field configured in a Content Type called `personalizedHero`.

- The Component field is configured to be repeatable
- We will add an instance of this Component field for each of the audiences we wish to tailor content for
- The Component is configured with a Resource Picker field to store the audience(s) for each variation, in addition to the content field(s) encapsulated within this component.

In this example we will retain the original `hero` field in the Content Type and that field serves as the default version. Alternatively, we could drop the `hero` field from this Content Type and rely on the `personalizedHero` field to contain all content. In this case we must include a variant of the component that serves as the default version to render in each Entry.

- We will render one default content variation when the visitor has not activated any of the audiences within the `personalizedHero` content variants

```json
{
  "id": "exampleHomePage",
  "projectId": "website",
  "dataFormat": "entry",
  "name": {
    "en-GB": "Example: Home Page"
  },
  "entryTitleField": "title",
  "fields": [
    {
      "id": "title",
      "name": {
        "en-GB": "Title"
      },
      "dataType": "string",
      "dataFormat": "heading",
      "groupId": "main"
    },
    {
      "id": "hero",
      "name": {
        "en-GB": "Hero"
      },
      "dataType": "object",
      "dataFormat": "component.personalizedhero",
      "groupId": "main"
    },
    {
      "id": "personalizedHero",
      "name": {
        "en-GB": "Personalized Hero"
      },
      "dataType": "objectArray",
      "dataFormat": "component.personalizedhero",
      "editor": {
        "properties": {
          "componentButtonLabel": "Add personalized variant"
        }
      },
      "groupId": "main"
    }
  ]
}
```

_Example Content Type JSON containing a `hero` component field, and another field using the same component called `personalizedHero` configured to allow multiple variants_

```json
{
  "id": "personalizedHero",
  "projectId": "website",
  "dataFormat": "component",
  "name": {
    "en-GB": "Personalized Hero"
  },
  "description": {
    "en-GB": "Create personalized variations for any audience"
  },
  "fields": [
    {
      "id": "audiences",
      "name": {
        "en-GB": "Audiences"
      },
      "dataType": "objectArray",
      "dataFormat": "audience",
      "validations": {
        "allowedIds": {
          "ids": ["returningVisitors", "potentialStudents", "campaignSignUp"]
        }
      },
      "editor": {
        "instructions": {
          "en-GB": "Choose one or more audiences that will have this variant rendered"
        },
        "properties": {
          "componentButtonLabel": "Add another audience"
        }
      }
    },
    {
      "id": "heading",
      "name": {
        "en-GB": "Heading"
      },
      "dataType": "string"
    },
    {
      "id": "leadIn",
      "name": {
        "en-GB": "Lead-In"
      },
      "dataType": "string",
      "editor": {
        "id": "text"
      }
    },
    {
      "id": "backgroundImage",
      "name": {
        "en-GB": "Background image"
      },
      "dataType": "object",
      "dataFormat": "image",
      "editor": {
        "properties": {
          "uploadPath": "/image-library",
          "filterPaths": ["/image-library"]
        }
      }
    }
  ]
}
```

_Example `personalizedHero` Component JSON containing an `audiences` field, and the content fields we are personalizing_

After we have made changes to the Component and Content Type, we can begin creating audence-specific variants of our content in a new or an existing Entry.

1. add the Resource Picker to the Component
2. add the repeating Component field to the Content Type
3. Publish the changes

Patterns similar to this can be applied to any content model.
