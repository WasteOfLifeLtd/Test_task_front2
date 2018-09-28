//Polyfill for Array.from
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method 
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

//initial pagination setup
var productsPerPage = 3;
var page = 1;
var templateProduct;
var productsJson;
$(document).ready(function(){
	//preserve the template item
	templateProduct = $('.product_horizontal:first');
	$.getJSON('products.json').done(function(allProducts){
		productsJson = allProducts;
		var productsToDisplay = selectItemsForPage(page, productsPerPage, allProducts);
		$.each(productsToDisplay, function(index, value){
			createProductCard(value);
		});
		createPagination(page, allProducts.length, productsPerPage);
	});
	
});

//selects items to be displayed depending on the page
//provides functionality to the template product
function selectItemsForPage(page, productsPerPage, allProducts){
	var resultingArray = [];
	if(page == 1){
		var productsPage = $('.products_page');
		productsPage.append(templateProduct);
		handleTemplateProductFunctionality();
		for(var i = 0; i < productsPerPage - 1; i++){
			resultingArray.push(allProducts[i]);
		}
	}
	else{
		templateProduct.remove();
		for(var i = 0; i < productsPerPage; i++){
			var product = allProducts[productsPerPage * page - productsPerPage - 1 + i];
			if(typeof product != 'undefined'){
				resultingArray.push(product);
			}
		}
	}
	return resultingArray;
}

//sets up initial pagination and calls adjustPaginatinoToCurrentPage, which hides irrelevant navigation buttons and show relevant ones depending on the page
function createPagination(page, totalNumberOfProducts, productsPerPage){
	var numberOfPages = Math.ceil(totalNumberOfProducts/productsPerPage);
	
	var pagination = $("<ul></ul>").addClass('pagination');
	var liFirst = $('<li><a href="#">1</a></li>');
	var liLast = $('<li><a href="#">' + numberOfPages + '</a></li>');
	var liPrevious = liFirst.clone();
	var liNext = liFirst.clone();
	var liCurrent = liFirst.clone();
	liCurrent.addClass('active');
	pagination.append(liFirst);
	pagination.append($('<li><span>...</span></li>'));
	pagination.append(liPrevious);
	pagination.append(liCurrent);
	pagination.append(liNext);
	pagination.append($('<li><span>...</span></li>'));
	pagination.append(liLast);
	
	pagination.find('li:not(.active) a, li:not(.active) span').hover(function(){
		$(this).css('background-color', '#fff');
	});
	
	adjustPaginationToCurrentPage(page);
	pagination.find('a').click(function(){
		$('.product_horizontal').remove();
		$.each(selectItemsForPage($(this).text(), productsPerPage, productsJson), function(index, value){
			createProductCard(value);
		});
		adjustPaginationToCurrentPage(parseInt($(this).text()));
	});
	$('.product__area').append(pagination);
	
	//hides irrelevant navigation buttons and show relevant ones depending on the page
	function adjustPaginationToCurrentPage(page){
		liPrevious.find('a').text(page-1);
		liNext.find('a').text(parseInt(page)+1);
		liCurrent.find('a').text(page);
		switch(page){
		case 1:
			pagination.find('>:lt(3)').hide();
			pagination.find('>:gt(2)').show();
		break;
		case 2:
			pagination.find('>:lt(2)').hide();
			pagination.find('>:gt(1)').show();
		break;
		case 3:
			pagination.find('>:eq(1)').hide();
			pagination.find('>:not(:eq(1))').show();
		break;
		case numberOfPages-2:
			pagination.find('>:eq(5)').hide();
			pagination.find('>:not(:eq(5))').show();
		break;
		case numberOfPages-1:
			pagination.find('>:eq(4), >:eq(5)').hide();
			pagination.find('>:not(:eq(5), :eq(4))').show();
		break;
		case numberOfPages:
			pagination.find('>:gt(3)').hide();
			pagination.find('>:lt(4)').show();
		break;
		default:
			pagination.children().show();
		break;
	}
	}
}

//creates, populates and provides functionality to a product card
function createProductCard(product){
	var newProduct = templateProduct.clone().show();
	$('.products_page:first')
		.append(newProduct);
	newProduct.find('.product_code').text('Код: ' + product.code.replace(/^0*/,''));
	newProduct.find('.product_photo img').attr('src',product.primaryImageUrl.replace('.jpg', '_220x220_1.jpg'));
	newProduct.find('.product_description .product__link').text(product.title);
	newProduct.find('.product_tags').children().not('p, a:first').remove();
	var associatedProductsArray = Array.from(new Set(product.assocProducts.split(';').filter(function(itm, i, a){
			return i == a.indexOf(itm);
		})));
	$.each(associatedProductsArray, function(index, value){
		value = index == 0 ? ' ' + value : value;
		value += index < associatedProductsArray.length-1 ? ',': '.';
		newProduct.find('.product_tags')
			.append(newProduct.find('.product_tags a:first').clone().text(value))
	})
	newProduct.find('.product_tags a:first-of-type').remove();
	newProduct.find('.goldPrice').text(product.priceGold);
	newProduct.find('.retailPrice').text(product.priceRetail);
	newProduct.find('.product_units p:first').text(function(){
		switch(product.unitAlt){
		case 'упак.':
			return 'За упаковку';
		break;
		case 'шт.':
			return 'За штуку';
		break;
		case 'м. кв.':
			return 'За ' + product.unitAlt;
		break;
		}
	});
	
	newProduct.find('.product_units p:last').text(function(){
		if(product.unit == product.unitAlt){
			newProduct.find('.product_units p:last').hide();
		}
		else{
			switch(product.unitFull){
			case 'упаковка':
				return 'За упаковку';
			break;
			case 'штука':
				return 'За штуку';
			break;
			case 'метр погонный':
				return 'За ' + product.unitFull;
			break;
			default:
			break;
			}
		}
	});
	
	newProduct.find('.unit--info span:first').text(function(){
		var result = '';
		switch(product.unit){
			case 'упак.':
				result = 'Продается упаковками:';
			break;
			case 'шт.':
				result = 'Продается поштучно:';
				newProduct.find('.unit--desc-i').css('marginTop', 0);
			break;
			case 'м/п':
				result = 'Продается погонными метрами:';
				newProduct.find('.list--unit-desc').css('paddingRight',0).css('paddingLeft',0);
				newProduct.find('.unit--desc-i').css('marginRight', 0);
			break;
			default:
			break;
		}
		return product.unit == product.unitAlt ? result.replace(':','') : result;
	});
	
	var unitInfo2 = newProduct.find('.unit--info span:last');
	unitInfo2.text(function(){
		if(product.unit == product.unitAlt){
			unitInfo2.hide();
			return;
		}
		return product.unitRatio + ' ' + product.unit + ' = ' + Math.round(product.unitRatioAlt * 100) / 100 + ' ' + product.unitAlt;
	});
	
	newProduct.find('.unit--wrapper .unit--select').click(function(){
		if(!$(this).hasClass('unit--active')){
			$(this).addClass('unit--active');
			$(this).siblings().removeClass('unit--active');
			newProduct.find('.goldPrice').text($(this).index() == 0 ? product.priceGold : Math.round(product.priceGoldAlt * 100) / 100);
			newProduct.find('.retailPrice').text($(this).index() == 0 ? product.priceRetail : Math.round(product.priceRetailAlt * 100) / 100);
		}
	});
	
	var input = newProduct.find('.stepper-input');
	input.change(function(){
		recountUnitToUnitAltConversion()
	});
	newProduct.find('.stepper .up').click(function(){
		input.val(parseInt(input.val())+1);
		recountUnitToUnitAltConversion();
	});
	newProduct.find('.stepper .down').click(function(){
		input.val(input.val() == 1 ? 1 : parseInt(input.val())-1);
		recountUnitToUnitAltConversion();
	});
	
	function recountUnitToUnitAltConversion(){
		newProduct.find('.unit--info span:last').text(input.val() + ' ' + product.unit + ' = ' + Math.round(product.unitRatioAlt * parseInt(input.val()) * 100) / 100 + ' ' + product.unitAlt);
	}
	
	newProduct.find('.btn_cart').attr('data-product-id',product.productId);
}

//provides stepper functionality for the template product
function handleTemplateProductFunctionality(){
	var templateInput = templateProduct.find('.stepper-input');
	templateInput.change(function(){
		templateRecount()
	});
	templateProduct.find('.stepper .up').click(function(){
		templateInput.val(parseInt(templateInput.val())+1);
		templateRecount();
	});
	templateProduct.find('.stepper .down').click(function(){
		templateInput.val(templateInput.val() == 1 ? 1 : parseInt(templateInput.val())-1);
		templateRecount();
	});
	function templateRecount(){
		templateProduct.find('.unit--info span:last').text(templateInput.val() + ' упак. = ' + Math.round(2.47 * parseInt(templateInput.val()) * 100) / 100 + ' м. кв');
	}
	templateProduct.find('.unit--wrapper .unit--select').click(function(){
		if(!$(this).hasClass('unit--active')){
			$(this).addClass('unit--active');
			$(this).siblings().removeClass('unit--active');
			templateProduct.find('.goldPrice').text(Math.floor(Math.random() * 1000));
			templateProduct.find('.retailPrice').text(parseFloat(templateProduct.find('.goldPrice').text()) * 900 / 1000);
		}
	});
}