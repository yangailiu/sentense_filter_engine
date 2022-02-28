class engine{

    constructor(obj, rule, priorObj)
    {
        this.obj = obj
        this.rule = rule
        this.priorObj = priorObj
    }

    getAtt(rule)
    {
        let pattern1 = /(?<={)[a-zA-Z.]+(?=})/
        let pattern2 = /(?<==).+/
        let att,sentense
        try
        {
            att = rule.match(pattern1)[0]
            sentense = rule.match(pattern2)[0]
        }
        catch(err)
        {
            console.log("规则"+rule+"没有按照'a=b'的格式编写，请修改","<br>")
            return ["",""]
        }
        return [att,sentense]
    }

    //正则匹配一般算术或逻辑表达式
    getEachElem(rule)
    {
        let pattern = /[a-zA-Z]+|[0-9]+\.?[0-9]?|<(=)?|>(=)?|&&|[\+\-\*/]|!(=)?|==|\|\||\(|\)/g
        // console.log(rule.match(pattern))
        return rule.match(pattern)
    }

    //替换字符串中的属性值
    getValue(arr,obj)
    {
        let item
        for(let i = 0;i < arr.length;i++)
        {
            item = obj[arr[i]]
            if(item) arr[i] = item
        }
        return arr
    }

    //中缀变后缀代替eval方法
    suffixExpression(arr, priorObj)
    {
        let symbolStack = new Stack() //用于暂存运算符
        let result = []            //用于保存结果
        let priorNow,priorLast
        for(let i = 0;i<arr.length;i++)
        {
            if(priorObj[arr[i]] == undefined)
            {
                result.push(arr[i])
            }
            else if(symbolStack.length() == 0 || arr[i] == "(")
            {
                symbolStack.push(arr[i])
            }
            else if(arr[i] == ")")
            {
                //依次将栈顶移到result数组，直到遇到"("
                while(symbolStack.length() != 0 && symbolStack.peek() != "(")
                {
                    result.push(symbolStack.peek())
                    symbolStack.pop()
                }
                if(symbolStack.length() == 0)
                {
                    console.log("表达式书写有误,未找到和‘)’匹配的‘(’","<br>")
                    return
                }
                else
                {
                    symbolStack.pop()
                }
            }
            else if(priorObj[arr[i]] != undefined)
            {
                //同栈中的最后一个符号进行比较
                //优先级高于或等于前一个则入栈
                //优先级低于前一个则依次与栈顶比较，如果低于则将栈顶元素移到result数组，直到优先级高于或等于当前栈顶，再将当前符号入栈
                priorNow = priorObj[arr[i]]
                priorLast = priorObj[symbolStack.peek()]
                while(priorNow > priorLast && symbolStack.length() != 0)
                {
                    result.push(symbolStack.peek())
                    symbolStack.pop()
                    priorLast = priorObj[symbolStack.peek()]
                }
                symbolStack.push(arr[i])
            }
        }
        while(symbolStack.length() != 0)
        {
            result.push(symbolStack.peek())
            symbolStack.pop()
        }
        return result
    }

    compare(a, symbol, b)
    {
        if(symbol == ">")
        {
            return a>b
        }
        else if(symbol == ">=")
        {
            return a>=b
        }
        else if(symbol == "<")
        {
            return a<b
        }
        else if(symbol == "<=")
        {
            return a<=b
        }
        else if(symbol == "==")
        {
            return a==b
        }
        else if(symbol == "!=")
        {
            return a!=b
        }
        else
        {
            console.log("错误原因：两个时间对象只能比较大小")
            return
        }
    }

    dateCalculator(a, symbol, b)
    {
        if(symbol == "+")
        {
            a.setDate(a.getDate()+Number(b))
            return a
        }
        else if(symbol == "-")
        {
            a.setDate(a.getDate()-Number(b))
            return a
        }
    }

    secondCalculator(a, symbol, b)
    {
        if(symbol == "+")
        {
            a.setTime(a.getTime()+Number(b))
            return a
        }
        else if(symbol == "-")
        {
            a.setTime(a.getTime()-Number(b))
            return a
        }
    }

    calculator(a, symbol, b)
    {
        let timeA, timeB, dateStrA, dateStrB
        //规定如果输入为一个时间对象和一个数字（或数字的字符串形式），则做日期的加减运算，只有出现“:”才做秒的加减运算
        if(typeof(a) == "string")
        {
            timeA = (a.indexOf(":") != -1)
            dateStrA = (a.indexOf("-") != -1 || a.indexOf("/") != -1 && a.indexOf(":") == -1)
        }
        let dateA = (a instanceof Date || a == Date())
        if(typeof(b) == "string")
        {
            timeB = (b.indexOf(":") != -1)
            dateStrB = (b.indexOf("-") != -1 || b.indexOf("/") != -1 && b.indexOf(":") == -1)
        }
        let dateB = (b instanceof Date || b == Date())
        let numStrA = (/^[0-9]+\.?[0-9]?$/.test(a))
        let numStrB = (/^[0-9]+\.?[0-9]?$/.test(b))
        
        if(timeA && !timeB && !dateStrB && !dateB && (symbol == "+" || "-") && numStrB)
        {
            //时刻+-数字
            a = new Date(a)
            return this.secondCalculator(a, symbol, b.toString())
        }
        else if(timeB && !timeA && !dateStrA && !dateA && symbol == "+" && numStrA)
        {
            //数字+时刻
            b = new Date(b)
            return this.secondCalculator(b, symbol, a.toString())
        }
        if(timeA || dateStrA)
        {
            a = new Date(a)
            dateA = true
        }
        if(timeB || dateStrB)
        {
            b = new Date(b)
            dateB = true
        }
        if(dateA && (symbol == "+" || "-") && numStrB)
        {
            //日期+-数字
            return this.dateCalculator(a, symbol, b.toString())
        }
        else if(dateB && symbol == "+" && numStrA)
        {
            //数字+日期
            return this.dateCalculator(b, symbol, a.toString())
        }
        else if(dateA && dateB)
        {
            return this.compare(a, symbol, b)
        }
        else
        {
            try
            {
                return eval(a+symbol+b)
            }
            catch(err)
            {
                console.log("出错了！表达式的 "+a+symbol+b+" 这部分书写错误")
            }
        }
    }

    countSuffixExpression(arr, priorObj)
    {
        let stack = new Stack()
        let a,b,c
        for(let i = 0;i<arr.length;i++)
        {
            if(arr[i] == "!")
            {
                stack.push(!stack.pop())
            }
            else if(priorObj[arr[i]] != undefined)
            {
                a = stack.pop()
                b = stack.pop()
                c = this.calculator(b, arr[i], a)
                if(c != undefined)
                {
                    stack.push( c )
                    // console.log(b+arr[i]+a+"的运算结果为："+c)
                }
                else 
                {
                    console.log(b+arr[i]+a,"表达式错误，无计算结果")
                    return
                }
            }
            else
            {
                stack.push(arr[i])
            }
        }
        c = stack.pop()
        if(c == "true" || "false") c = eval(c)
        return c
    }

    //一般表达式解析
    normalFilter(obj, rule, priorObj)
    {
        let arr = this.getEachElem(rule)
        if(arr == null) return
        arr = this.getValue(arr,obj)
        let resultArr = this.suffixExpression(arr, priorObj)
        // console.log(resultArr)
        return this.countSuffixExpression(resultArr, priorObj)
    }

    //包含条件判断的表达式解析
    ifFilter(obj,rule,priorObj)
    {
        let patternIf = /IF|THEN|ELSEIF|ELSE|((?!IF|THEN|ELSEIF|ELSE|\(|\)).)+/g
        let arr = rule.match(patternIf)
        if(arr == undefined)
        {
            console.log("请输入正确的条件判断表达式","<br>")
            return
        }
        for(let i = 0;i < arr.length;i++)
        {
            if(arr[i] == "IF"||"ELSEIF")
            {
                if(this.normalFilter(obj,arr[i+1],priorObj))
                {
                    // console.log(this.normalFilter(obj,arr[i+3]),priorObj)
                    return this.normalFilter(obj,arr[i+3],priorObj)
                }
                i = i+3
            }
            else if(arr[i] == "THEN")
            {
                return this.normalFilter(obj,arr[i+1],priorObj)
            }
            else
            {
                console.log("语句"+rule+"IF表达式格式不满足要求，请检查并修改表达式"+"<br>")
            }
        }
        return
    }

    main()
    {
        let obj = this.obj
        let rule = this.rule
        let priorObj = this.priorObj
        let attribute,newRule
        [attribute,newRule] = this.getAtt(rule)
        let result = (newRule.indexOf("IF") == -1)? this.normalFilter(obj,newRule,priorObj) : this.ifFilter(obj,newRule,priorObj)
        if(result == undefined) console.log(rule+"中的运算表达式"+"书写有误，无结果","<br>")
        console.log(attribute,result)
    }
}

//优先级定义,数值越小优先级越高
const priorObj =
{
    "!":1,
    "*":2,
    "/":2,
    "%":2,
    "+":3,
    "-":3,
    ">":4,
    ">=":4,
    "<":4,
    "<=":4,
    "==":5,
    "!=":5,
    "&&":6,
    "||":7,
    "(":8,
    ")":8,
}

const obj = 
{
    date : "2021-4-31",
    days : "9",
    deadline : "2021/4/10",
    income : "10000",
    outcome : "5000",
    clerk:true,
    manager:false,

    //获取当前时间一定要加new
    now:new Date(),
    time:"2021-3-31 15:30:00",
    //一定注意月份从0开始，范围是0-11
    today:new Date(2021,3,24),
}

const rules = 
[
    "{bool}={days}/2+{date}<={deadline}-{days}/2",
    "{a.editable}=!({days}+{date}<={deadline}-{days}&&({income}-{outcome})/{{income}}>=0.5||{date}+1!={deadline})",
    "{incomeTrue}={income}*1.5-{outcome}=={income}",
    "{endTime}={days}+{date}",
    "{b.editable}=IF({clerk}==true)THEN(false)ELSEIF({clerk}==false)THEN(false)ELSE(false)",
    "{date.correct}={date}>{today}",
    "{time.correct}={time}>={now}",
    "{rightnow}={now}"
]

function Stack()
{
    this.dataStore = [];
    this.top = 0;
    this.push = push;
    this.pop = pop;
    this.peek = peek;
    this.clear = clear;
    this.length = length;
    this.printElement = printStack;

    //注意++操作符的位置，它放在this.top的后面，这样新入栈的元素就被放在top的当前位置对应的位置，同时top自加1，指向下一个位置
    function push(element)
    {
        this.dataStore[this.top++] = element;
    }
    //返回栈顶元素，同时top的位置减1
    function pop()
    {
        return this.dataStore[--this.top];
    }
    //peek()方法返回数组的第top-1个位置的元素，即栈顶元素
    function peek()
    {
        return this.dataStore[this.top-1];
    }
    //将top的值设置0，即清空一个栈
    function clear()
    {
        this.top = 0;
    }
    //返回变量top的值即为栈内元素的个数
    function length()
    {
        return this.top;
    }
    
    //输出栈内元素
    function printStack()
    {
        while (this.top>0)
        {
            document.writeln(this.pop()+"  ");
        }
    }
}

let rule, newClass
for(var i in rules)
{
    rule = rules[i]
    newClass = new engine(obj,rule,priorObj)
    newClass.main()
}
