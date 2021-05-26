const loader_utils = require("loader-utils");


/**
 * Returns an object in the format
 *
 * {
 *  startIndex,
 *  endIndex,
 *  data,
 *  stringify
 *  
 * }
 * @param {*} input
 * @param {*} left
 * @param {*} right
 */
function getStringBetween(input, left, right)
{
    let startIndex = input.indexOf(left);
    if(startIndex != -1)
    {
        startIndex+=+left.length;
        let endIndex = input.indexOf(right, startIndex);
        if(endIndex != -1)
        {
            let value = input.substring(startIndex, endIndex);
            let stringify = false;
            if(value.indexOf('"') !== -1)
            {
                value = value.substring(1, value.length-1);
                stringify = true;
            }
            return {
                startIndex,
                endIndex,
                value: input.substring(startIndex, endIndex),
                stringify
            }
        }
        return {
            startIndex,
            endIndex : -1,
            value : "",
            stringify : false
        }
    }
    return {
        startIndex : -1,
        endIndex : -1,
        value : "",
        stringify: false
    }
}

function isInsideComment(source, index)
{
    const startIndex = index;

    //Check multiline
    const multilineEndIndex = source.indexOf("*/", startIndex);
    if(multilineEndIndex !== -1)
    {
        const multilineStartIndex = source.lastIndexOf("/*", multilineEndIndex);
        if(startIndex > multilineStartIndex && startIndex < multilineEndIndex)
            return true;
    }
    const oneLinerStartIndex = source.lastIndexOf("//", startIndex);
    if(oneLinerStartIndex !== -1)
    {
        const oneLinerEndIndex = source.indexOf("\n", oneLinerStartIndex);
        if(startIndex > oneLinerStartIndex && startIndex < oneLinerEndIndex)
            return true;
    }
    return false;
   
}

function getVarType(source, varName)
{
    //Clean variable
    if(varName.indexOf('"') != -1)
        varName = varName.substring(1, varName.length-1);
    const thisIndex = varName.indexOf("this.");
    let i = 1;

    if(thisIndex !== -1)
        varName = varName.substring("this.".length);
    else if(varName === "this")
    {
        const reg = RegExp("class (\\w+)", "gm");
        let ret = reg.exec(source);
        if(!ret || ret.length < 2)
            throw new SyntaxError("Type for "+varName+ " not found");
        while(isInsideComment(source, ret.index))
        {
            ret = reg.exec(source);
            if(!ret || ret.length < 2)
                throw new SyntaxError("Type for "+varName+ " not found");
        }
        return ret[1];
    }
    const reg = RegExp(varName+"\\s*:\\s*([\\w.]+)");
    const ret = reg.exec(source);
    if(!ret || ret.length < 2)
        throw new SyntaxError("Type for "+varName+ " not found");

    
    while(isInsideComment(source, ret.index))
    {
        ret = reg.exec(source);
        if(!ret || ret.length < 2)
            throw new SyntaxError("Type for "+varName+ " not found");
    }
    return ret[1];
}

function replaceDecltype(source, word)
{
    if(!word)
        word = "decltype";
    word+="(";
   
    let obj = getStringBetween(source, word, ")");

    while(obj.endIndex !== -1)
    {
        if(obj.value !== "")
        {
            let varType = getVarType(source, obj.value);
            if(obj.stringify)
                varType = '"' + varType + '"';
            source = source.replace(word+obj.value+")", varType);
        }
        obj = getStringBetween(source, word, ")");
    }
    return source;
}


/**
 * Used for typescript source. It can't do intermodule decltype
 * @param {*} source
 * @returns
 */
module.exports = function(source)
{
    const opts = loader_utils.getOptions(this);
    let keyword = "decltype";
    if(opts.keyword)
        keyword = opts.keyword;
    if(source.indexOf(keyword) === -1)
        return source;
    return replaceDecltype(source, keyword);
}