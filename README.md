# decltype-loader


## WARN: Typescript Only

This is a webpack loader, which uses Regexes for finding the type declared for a variable.
That means it can't find any decltype that wasn't defined in the same file. I did like that
because for my purposes, it is good enough.

For using it, it requires a typescript loader or a babel plugin inside your webpack config.
After that, you can add to your loader config

`{ test: /\.tsx?$/, use: [{ loader: path.resolve('../decltype-loader.js'), options: {keyword:"decltype"}}]}`

For applying it in your code, just call the following:
```ts
decltype(variable)
```

By doing that, you will be able to retrieve what type is defined. It will take a variable that was
defined like

```ts
const variable : string = "";
```

By doing that, it will replace any `decltype(variable)` with `string`;
If you need it stringified, you can do the following:

```ts
console.log(decltype("variable"))
```

With that, decltype will expand to `"string"`.

If you need to take a class decltype, you use the `"this"`

```ts

class Test
{
    public _type : string;
    constructor()
    {
        this._type = decltype("this");
        console.log(decltype("this._type"))
    }
}
```

With that, the property `_type` will get the value `"test"`. and will print `"string"`

## REMINDER

- It does not work **inter-modules**
- It may conflict when variables have the same name
- Open for pull requests
