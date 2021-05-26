class Test
{
    _type : string;
    constructor()
    {
        this._type = decltype("this");
        console.log(this._type);
        console.log(decltype(this._type));
    }
}

new Test();