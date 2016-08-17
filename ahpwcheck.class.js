/** 
 * 
 * <br />
 * DOC:          <a href="http://www.axel-hahn.de/docs/ahpwcheck/index.htm" target="_blank">http://www.axel-hahn.de/docs/ahpwcheck/index.htm</a><br />
 * SOURCE:       <a href="https://github.com/axelhahn/ahpwcheck"            target="_blank">https://github.com/axelhahn/ahpwcheck</a><br />
 * <br />
 * 
 * @author    Axel Hahn
 * @version   1.2
 *
 * @this {ahpwcheck}
 * 
 * @constructor
 * 
 * @example
 * &lt;script>
 * var oPwCheck = new ahpwcheck(aOptions);
 * alert(oPwCheck.getScore('My:0815;Password');
 * &lt;/script>
 * 
 * @param {object} aOptions - options to override checks, texts or weights for scoring (optional)
 * @return none
 */
var ahpwcheck = function (aOptions) {

    // ----------------------------------------------------------------------
    // internal variables
    // ----------------------------------------------------------------------

    this._oDivOut = false; 	  // div object of output
    this._oInput = false; 	  // object of password field
    this.name = false;            // name of the instance outside the class
    this._sCallback = false;      // callback function on change

    /**
     * language specific texts; you can override them with method setOptions
     * in the options array create a key 'lang'
     */
    this.aLang = {
        'introtext': 'Check of the password - matching requirements: [COUNT]',
        
        'lcase': 'lower case: [COUNT]',
        'ucase': 'upper case: [COUNT]',
        'digits': 'digits: [COUNT]',
        'special': 'special chars: [COUNT]',
        'count': 'chars (min [REQUIRED]): [COUNT]'
    };

    this.aResult = {};

    /**
     * individual checks, you can override "required" option with method setOptions
     * in the options array create a key 'checks'
     */
    this.aChecks = {
        'lcase': {
            'required': 1,
            'weight': 1
        },
        'ucase': {
            'required': 1,
            'weight': 1
        },
        'digits': {
            'required': 1,
            'weight': 1.5
        },
        'special': {
            'required': 1,
            'weight': 2
        },
        'count': {
            'required': 8,
            'weight': 1
        }
    };
    

    // ----------------------------------------------------------------------
    // functions for init
    // ----------------------------------------------------------------------
    
    
    /**
     * watch - init for visual display in html body; it adds the method 
     * checkPw() to eventlisters of the password field and starts the output
     * 
     * @param {string} sIdInput  id of input field where the user enters a new password
     * @param {string} sIdOut    id of a div for output
     * @returns {Boolean}
     */
    this.watch = function (sIdInput, sIdOut) {
        this._getName();
        this._oInput = document.getElementById(sIdInput);
        if (this._oInput) {
            eval("\
                document.getElementById('" + sIdInput + "').addEventListener('change',  function () {" + this.name + ".checkPw()}, false);\n\
                document.getElementById('" + sIdInput + "').addEventListener('keydown', function () {" + this.name + ".checkPw()}, false);\n\
                document.getElementById('" + sIdInput + "').addEventListener('keyup',   function () {" + this.name + ".checkPw()}, false);\n\
                ");
        }
        this._oDivOut = document.getElementById(sIdOut);
        this.renderAll();
        return true;
    };

    /**
     * internal helper function - called in init()
     * it detects the name of the ocject variable that initialized the class
     * @returns {string}
     */
    this._getName = function () {
        // search through the global object for a name that resolves to this object
        for (var name in this.global)
            if (this.global[name] === this) {
                return this._setName(name);
            }
    };

    /**
     * internal helper function - called in getName()
     * set internal varible
     * @param {string} sName  name of the player object
     * @returns {string}
     */
    this._setName = function (sName) {
        this.name = sName;
        return this.name;
    };

    /**
     * set options 
     * - override texts
     * - change requirements for single checks 
     * - change weights for scoring
     */
    this.setOptions = function (aOptions) {
        console.log(aOptions);
        if (aOptions) {
            for (var s in aOptions) {
                switch (s) {
                    case 'callback':
                        this._sCallback=aOptions[s];
                        break;
                    case 'checks':
                        for (var s2 in this.aChecks) {
                            if (aOptions[s][s2]){
                                if ("required" in aOptions[s][s2]){
                                    this.aChecks[s2]['required']=aOptions[s][s2]['required'];
                                };
                                if ("weight" in aOptions[s][s2]){
                                    this.aChecks[s2]['weight']=aOptions[s][s2]['weight'];
                                };
                            }
                        }
                        break;
                    case 'lang':
                        for (var s2 in this.aLang) {
                            if (aOptions[s][s2]){
                                this.aLang[s2]=aOptions[s][s2];
                            }
                        }
                        break;
                }
            }
        }

        return true;
    };

    // ----------------------------------------------------------------------
    // checks
    // ----------------------------------------------------------------------
    
    /**
     * helper function - calculate score 
     * @see _passTests()
     */
    this._calcScore = function () {
        var iChecks=0;    
        var iTotalMax=0;
        var strength=0;
        
        // --- calculate max score
        for (var s in this.aChecks) {
            iRequired=this.aChecks[s]['required'];
            if (iRequired>0){
                fWeight=this.aChecks[s]['weight'];
                iChecks++;
                iTotalMax+=iRequired*fWeight;
            }
        }
        // --- check current score
        for (var s in this.aChecks) {
            iRequired=this.aChecks[s]['required'];
            if (iRequired) {
                iVal=this.aChecks[s]['count'];
                fWeight=this.aChecks[s]['weight'];
                if (!iVal) {
                    iVal=0;
                }
                if (iVal>iRequired){
                    iVal=iRequired;
                }
                strength+=iVal*fWeight;
            }
        }
        return Math.round(strength/iTotalMax*1000)/1000;
        // return Math.round(strength/iTotalMax*1000)/1000  + " - " + strength + " von " + iTotalMax + " Checks:" + iChecks;
    };
    
    /**
     * helper function - count captital letters in a string
     * @see _passTests()
     * 
     * @param {string}  s  string
     * @return {string}
     */
    this._countCapitalLetters = function (s) {
        return s.replace(/[^A-Z]*/g, '').length;
    };
    /**
     * helper function - count digits in a string
     * @see _passTests()
     * 
     * @param {string}  s  string
     * @return {string}
     */
    this._countDigits = function (s) {
        return s.replace(/[^0-9]*/g, '').length;
    };

    /**
     * helper function - count lowercase letters in a string
     * @see _passTests()
     * 
     * @param {string}  s  string
     * @return {string}
     */
    this._countLowerLetters = function (s) {
        return s.replace(/[^a-z]*/g, '').length;
    };

    /**
     * helper function - count special chars (non letters or digits) in a string
     * @see _passTests()
     * 
     * @param {string}  s  string
     * @return {string}
     */
    this._countSpecialchars = function (s) {
        return s.replace(/[a-zA-Z0-9]*/g, '').length;
    };

    /**
     * helper function - reset internal check data
     */
    this._resetChecks = function () {
        var iChecks=0;
        for (var s in this.aChecks) {
            if(this.aChecks[s]['required']){
                iChecks++;
            }
            this.aChecks[s]['count'] = 0;
            this.aChecks[s]['check'] = false;
            this.aChecks[s]['label'] = this.aLang[s];
        }
        this.aResult['count'] = 0;
        this.aResult['required']=iChecks;
        this.aResult['check'] = false;
        this.aResult['score']=false;
        this.aResult['label']=this.aLang['introtext'];
    };


    /**
     * helper function - make single tests and get their counts; get the score$
     * 
     * @param {string} sPassword  password
     * @returns {undefined}
     */
    this._passTests = function (sPassword) {
        this._resetChecks();
        if(sPassword){
            this.aChecks['lcase']['count'] = this._countLowerLetters(sPassword);
            this.aChecks['ucase']['count'] = this._countCapitalLetters(sPassword);
            this.aChecks['digits']['count'] = this._countDigits(sPassword);
            this.aChecks['special']['count'] = this._countSpecialchars(sPassword);
            this.aChecks['count']['count'] = sPassword.length;
        }
        var iOK=0;
        var iChecks=0;
        for (var s in this.aChecks) {
            this.aChecks[s]['check'] = this.aChecks[s]['count'] >= this.aChecks[s]['required'];
            iChecks++;
            if (this.aChecks[s]['check']){
                iOK++;
            };
        }
        this.aResult['count']=iOK;
        this.aResult['check']=iOK>this.aResult['required'];
        this.aResult['score']=this._calcScore();
    };

    /**
     * get object with results containing all single checks and total result 
     * with scoring
     * 
     * @returns {object}
     */
    this.getChecks = function () {
        var aReturn={};
	for (var s in this.aChecks) {
		aReturn[s]={
			'required': this.aChecks[s]['required'],
			'weight': this.aChecks[s]['weight']
		};
	};
        return aReturn;
    };
    
    /**
     * get object with results containing all single checks and total result 
     * with scoring
     * 
     * @param {string} sPassword
     * @returns {object}
     */
    this.getResult = function (sPassword) {
        this._passTests(sPassword);
        var aReturn=this.aResult;
        delete aReturn["label"];
        return aReturn;
    };
    /**
     * get scoring (a avalue 0..1); It says how many requirements were 
     * fulfilled in a given password. It depends on the number of checks, 
     * their required count and the weight for each check.
     * (It is NOT the measurement for the real strength of a given password.)
     * 
     * @param {string} sPassword
     * @returns {object}
     */
    this.getScore = function (sPassword) {
        this._passTests(sPassword);
        return this.aResult['score'];
    };
    
    // ----------------------------------------------------------------------
    // rendering
    // ----------------------------------------------------------------------


    /**
     * helper function - replace an integer value
     * 
     * @param {string}   sLabel    string with placeholders
     * @param {string}   sReplace  placeholder to replace
     * @param {integer}  iValue    value to insert
     * @returns {string}
     */
    this._ReplaceInt = function (sLabel, sReplace, iValue) {
        if(!iValue){
            iValue=0;
        }
        return sLabel.replace(sReplace, iValue);
    };

    /**
     * helper function - replace all known placeholders in a string
     * @param {object}  aItem  check item containing a key "label"
     * @returns {String|aItem.label}
     */
    this._getLabel = function (aItem) {
        var sLabel=aItem['label'];
        sLabel=this._ReplaceInt(sLabel, '[COUNT]', aItem['count']);
        sLabel=this._ReplaceInt(sLabel, '[REQUIRED]', aItem['required']);
        if ("score" in aItem){
            sLabel=this._ReplaceInt(sLabel, '[SCORE]', aItem['score']);
        }
        return sLabel;
    };
    
    /**
     * re-read watched input field and update visual output; this function
     * will be added as handler to the password field
     * 
     * @returns {undefined}
     */
    this.checkPw = function () {
        var sPassword = this._oInput.value;
        this._passTests(sPassword);
        this.renderAll();
        if(this._sCallback){
            eval(this._sCallback);
        }
    };
    
    /**
     * ouput all: put introtext and all checks into the output div
     * 
     * @returns {undefined}
     */
    this.renderAll = function () {
        var sHtml = '';
        sHtml += '<div class="divahpwcheck">';
        sHtml += this.renderIntro();
        sHtml += this.renderChecks();
        sHtml += '<div style="clear: both;"></div>';
        sHtml += '</div>';
        // sHtml += this._calcScore();
        // sHtml += this.renderBar();
        this._oDivOut.innerHTML = sHtml;
    };
    
    /**
     * get html code to render all reqired single checks 
     * 
     * @returns {string}
     */
    this.renderChecks = function () {
        var sHtml='';
        for (var s in this.aChecks) {
            if(this.aChecks[s]['required']>0){
                this.aChecks[s]['label']=this.aLang[s];
                sHtml += '<div class="divCheck' + (this.aChecks[s]['check'] ? ' checkok' : '') + '" id="' + s + '">' + this._getLabel(this.aChecks[s]) + '</div>';
            }
        }
        return sHtml;
    };

    /**
     * get html code to render intro text
     * 
     * @returns {string}
     */
    this.renderIntro = function () {
        return '<p>'+this._getLabel(this.aResult)+'</p>';
    };

    // ----------------------------------------------------------------------
    // init object
    // ----------------------------------------------------------------------

    if (aOptions) {
        this.setOptions(aOptions);
    };
    this._resetChecks();
};
ahpwcheck.prototype.global = this; // required for _getName()