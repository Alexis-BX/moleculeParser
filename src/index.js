import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/** general functions used for classifying characters, return booleans */
function isCap(a){
    return ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].includes(a);
}

function isLow(a){
    return ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].includes(a);
}

function isNum(a){
    return ['0','1','2','3','4','5','6','7','8','9'].includes(a);
}

/** basic element class */
class Element {
    constructor(elem, amount=1){
        this.name = elem;
        this.amount = amount;
	}
}

/** basic molecule class */
class Molecule {
    constructor() {
        this.elemList = []
    }

	/** add an element to the molecule */
    addElem(name, amount=1) {
        for (var i=0; i<this.elemList.length; i++){
            if(this.elemList[i].name === name){
                this.elemList[i].amount += amount;
                return false;
            }
		}
		var elem = new Element(name, amount)
        this.elemList.push(elem);
        return true;
    }
	
	/** in the case of A(B), merges molecule B into A */
    mergeMolecule(molecule){
        for (var i=0; i<molecule.elemList.length; i++){
            this.addElem(molecule.elemList[i].name, molecule.elemList[i].amount);
        }
    }

	/** in the case of (A)n, multiplies each element of A by n */
    multiply(amount){
        if (amount === 0) this.elemList = [];
        if (amount === 1) return;
        for (var i=0; i<this.elemList.length; i++){
            this.elemList[i].amount *= amount;
        }
	}
}

/** parses the entire molecule string */
function parse(m){
	var molecule = new Molecule();
	var i = 0;
	var L = m.length;
	while(i<L){
		var e = '';
		var n = '';

		if (isCap(m[i])){
			e = m[i];
			i++;
			while (i<L && isLow(m[i])){
				e += m[i];
				i++;
			}
			while (i<L && isNum(m[i])){
				n += m[i];
				i++;
			}
			n = (n==='') ? 1 : Number(n);
			molecule.addElem(e, n);
		
		} else if (['(','[','{'].includes(m[i])){ 
			/* if a bracket is found, finds the closing one that goes with it and 
			 * recursively calls parsing on the interior.
			 * If no closing one is found, it is assumed to be at the very end.
			 */
			 var target;
			switch (m[i]){
				case '(': target = ')'; break;
				case '[': target = ']'; break;
				default: target = '}'
			}
			var count = 0;
			var j = i+1;
			while(j<L && count<1){
				if (m[j] === m[i]){
					count--;
				}
				if (m[j] === target){
					count++;
				}
				j++;
			}
			if (count<1){
				alert("Unclosed bracket!");
				j++;
			}
			var ret = parse(m.substring(i+1, j-1));
			i = j;
			while (i<L && isNum(m[i])){
				n += m[i];
				i++;
			}
			n = (n==='') ? 1 : Number(n);
			ret.multiply(n);
			molecule.mergeMolecule(ret);

		} else {
			// in the case of an unauthorised symbol is found, it is simply skipped 
			alert("Unauthorised symbol: " + m[i]);
			i++;
		}
	}
	return molecule;
}

/** Classe which handels all the UI and rendering */
class Display extends React.Component {
	constructor(props) {    
		super(props);
		this.molecule = new Molecule();
		this.state = {value: '', submitted: false};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event){
		this.molecule = parse(this.state.value);
		this.setState({ submitted: true })
		event.preventDefault();
	}

	renderMolecule(){
		var rows = [];
		for (var i=0; i<this.molecule.elemList.length; i++){
			rows.push(
				<li>{this.molecule.elemList[i].name + ' -> '}
				    {this.molecule.elemList[i].amount}</li>
			);
		}

		return (
			<div className="Molecule">
				<ul>
					{rows}
				</ul> 
			</div>
		);
	}
	
	render(){
		return (
			<div className="Display">
				ENTER YOUR MOLECULE:
				<p>
					<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/220px-React-icon.svg.png" alt="react atom"/>
				</p>
			<form onSubmit={this.handleSubmit}>
				<label>
					<input type="text" value={this.value} onChange={this.handleChange}/>        
				</label>
				<p>
					<input type="submit" value="Decompose!" />
				</p>
      		</form>
			  {this.state.submitted && this.renderMolecule()}
			</div>
		);
	}
}

ReactDOM.render(
  <Display />,
  document.getElementById('root')
);