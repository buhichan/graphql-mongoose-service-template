/**
 * Created by buhi on 2017/4/28.
 */
import * as React from "react"
import injectCSS from "react-jss";

@injectCSS({
    'card-group':{
        display:"flex",
        justifyContent:"space-between",
        flexWrap:"wrap",
        margin: "-15px -15px 15px -15px",
        "&>div":{
            margin:15,
            width:200,
            height:150,
            borderRadius:5
        }
    }
})
export class CardGroup extends React.PureComponent<React.HTMLProps<HTMLDivElement>&{classes?,sheet?},any>{
    render(){
        const {children, classes, style} = this.props;
        return <div className={classes['card-group']} style={style}>
            {children}
        </div>
    }
}

interface NumberCardProps{
    title:any,
    color?:any,
    onClick?():void
}

@injectCSS({
    'card':{
        cursor:props=>props.onClick?"pointer":undefined
    },
    'title':{
        color:props=>props.color,
        padding:20
    },
    'body':{
        padding:10,
        fontSize:40,
        textAlign:"center"
    }
})
export class NumberCard extends React.PureComponent<NumberCardProps&React.HTMLProps<any>&{classes?,sheet?},any>{
    render() {
        const {title, children, classes, sheet, onClick, style} = this.props;
        return <div style={style} className={classes.card} onClick={onClick}>
            <div className={classes.title}>
                {title}
            </div>
            <div className={classes.body}>
                {children}
            </div>
        </div>
    }
}