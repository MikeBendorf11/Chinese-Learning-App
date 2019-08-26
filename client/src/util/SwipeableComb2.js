import React from 'react';
import { InputGroup, InputGroupAddon, InputGroupText, Input } from 'reactstrap'
import '../style/swipeable.scss'
import ReactDOM from "react-dom";
import Lesson from "./Lesson"

var log = (a) => console.log(a)

/**
 * A initial props.value is loaded
 * Horizontal moves to next character in the units
 * Vertical display contents of the comb obj
 * @props 
 *  { value } : an array of combs or defs.
 *  { index } : starts at empty/last of array to hide clues
 * @events { OnTextChange, IndexChange } sync roulette with with type2
 */
export default class SwipeableChar extends React.Component {
  constructor(props) {
    super(props);
    
    this.OnTextChange = this.OnTextChange.bind(this)
    this.incrementOrderIndex = this.incrementOrderIndex.bind(this)
    this.decrementOrderIndex = this.decrementOrderIndex.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.toggleWritable = this.toggleWritable.bind(this)
    this.swipeCount = 0
    this.clickCount = 0
    
    var comb = this.props.value
    this.order = new Lesson().combOrder('figurative', comb.figurative)
    this.length = this.order.length
    var orderIndex = 0
    var combIndex =  0//comb.figurative.length-1
    var value = comb[this.order[orderIndex]][combIndex]

    this.state = { orderIndex, combIndex, value }

  }

  OnTextChange(e){
    var combIndex = this.state.combIndex
    var orderIndex = this.state.orderIndex

    var value = this.props.value[this.order[orderIndex]][combIndex] = e.target.value
    this.setState({ orderIndex, combIndex, value })
  }
  
  componentDidMount() {
    //assign same class to all input groups
    this.inputGroup = ReactDOM.findDOMNode(this)
    this.input = this.inputGroup.getElementsByTagName('input')[0]
    this.setWidthofInput()
  }
  setWidthofInput(){
    if(this.state.value){
      var elem = document.createElement('span')   
      elem.style.fontSize = '2em' 
      elem.style.position = 'absolute'
      elem.style.left = -1000
      elem.style.top = -1000
      elem.style.display = 'inline'
      elem.style.padding = '0 auto'
      elem.innerHTML = this.state.value
      document.body.appendChild(elem)
      const width = elem.clientWidth + 25
      document.body.removeChild(elem)
      this.inputGroup.style.width = width +'px'
      
    } else {
      this.inputGroup.style.width = '100px'
    }
      this.inputGroup.style.margin = '0 auto'
    
  }

  delayCss(element, cssClass) {
    return new Promise(resolve => {
      setTimeout(() => {
        element.classList.contains(cssClass) ?
          element.classList.remove(cssClass) :
          element.classList.add(cssClass)
        resolve()
      }, 250);
    })
  }
  simpleDelay() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 300);
    })
  }

  horizontalSequence(dir1, dir2) {
    var element = this.input
      element.classList.add('sw' + dir1)
      if(element.classList.contains('show')) element.classList.add('hide')
      this.delayCss(element, 'sw' + dir2)
        .then(() => this.delayCss(element, 'sw' + dir1))
        .then(() => this.delayCss(element, 'sw' + dir2))   
  }

  verticalSequence(dir1, dir2){
    var element = this.input
    element.classList.add('sw' + dir1)
    if(element.classList.contains('show')) element.classList.add('hide')
    this.delayCss(element, 'sw' + dir2)
      .then(() => this.delayCss(element, 'sw' + dir1))
      .then(() => this.delayCss(element, 'sw' + dir2))
      
  }

  //swipe events
  handleTouchStart(evt) {
    this.xDown = evt.touches[0].clientX;
    this.yDown = evt.touches[0].clientY;
    this.previousScrollLeft = this.input.scrollLeft
  }
  
  handleTouchMove(evt) {
    if (!this.xDown || !this.yDown) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;
    var xDiff = this.xDown - xUp;
    var yDiff = this.yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // Most significant.
      if (xDiff > 0) {
        //left motion
        this.horizontalSequence('left', 'right')
      } else {
        //right motion
        this.horizontalSequence('right', 'left')
      }
    } else {
      if (yDiff > 0) {
        //up motion
        this.verticalSequence('up','down')
        this.simpleDelay().then(() => this.incrementOrderIndex())
        .then(()=>this.setWidthofInput())
      } else {
        //down motion
        this.verticalSequence('down','up')
        this.simpleDelay().then(() => this.decrementOrderIndex())
        .then(()=>this.setWidthofInput())

      }
    }
    this.xDown = null;
    this.yDown = null;
  }


  incrementOrderIndex() {
    var orderIndex = this.state.orderIndex + 1 > this.length - 1 ? 
      0 : this.state.orderIndex + 1
    var combIndex = this.state.combIndex
    var value = this.props.value[this.order[orderIndex]][combIndex]
    this.setState({ orderIndex, combIndex, value })
  }

  decrementOrderIndex() {
    var orderIndex = this.state.orderIndex - 1 < 0 ? 
      this.length-1 : this.state.orderIndex -1
    var combIndex = this.state.combIndex
    var value = this.props.value[this.order[orderIndex]][combIndex]
    this.setState({ orderIndex, combIndex, value })
  }

  toggleWritable(e) {
    this.clickCount++ //double click check
    setTimeout(()=>this.clickCount = 0,500) 
    if(this.clickCount===2){
      e.target.hasAttribute('readonly') ?
        e.target.removeAttribute('readonly') :
        e.target.setAttribute('readonly', '')
    }
  }

  render() {
    return (
      <InputGroup>
        <Input
          readOnly
          className='swipeable'
          value={this.state.value}
          onChange={this.OnTextChange}
          onTouchStart={this.handleTouchStart}
          onTouchMove={(e)=>{this.handleTouchMove(e); 
            e.target.setAttribute('readonly', '')}}
          onClick={this.toggleWritable}
          onBlur={(e)=>e.target.setAttribute('readonly', '')}
        />
      </InputGroup>
    )
  }
}