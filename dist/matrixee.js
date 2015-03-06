(function(root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory(
		  require('transform-to-matrix'),
		  require('matrix-utilities'),
		  require('umodel')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			'matrixee',
			[
				'transform-to-matrix',
				'matrix-utilities',
				'umodel'
			],
			factory
		);
	} else {
		root.Matrixee = factory(
			root['transform-to-matrix'],
			root['matrix-utilities'],
			root.umodel
		);
	}
})(this, function(transformToMatrix, matrixUtilities, umodel) {

// convert strings like "55deg" or ".75rad" to floats (in radians)
var _getRad = function (string) {
	if (typeof string === 'string') {
		var angle     = parseFloat(string, 10),
			isDegrees = string.indexOf('deg') > -1

		// convert deg -> rad?
		if (isDegrees) {
			angle *= Math.PI / 180
		}

		return angle
	}

	return string
};

var Matrixee = function Matrixee (data) {
	// default options
	this.model = new umodel({
		matrix: new matrixUtilities.Identity(),
		transformations: {
			perspective : new matrixUtilities.Identity(),
			rotate      : new matrixUtilities.Identity(),
			scale       : new matrixUtilities.Identity(),
			skew        : new matrixUtilities.Identity(),
			translate   : new matrixUtilities.Identity()
		}
	})

	// set data?
	if (data) {
		this.matrix(data)
	}
}

Matrixee.prototype = {
	// set matrix in model
	matrix: function (data) {
		////DEV
		var rows, columns;
		if (data.length == null) {
			throw new TypeError('expected parameter `data` to be an Array, but was given a ' + typeof data)
		}

		rows    = data.length;
		columns = rows > 0 ? rows : 0;

		if (rows !== 4 || columns !== 4) {
			throw new Error('expected parameter `data` to be a 4x4 matrix of arrays, but was given a ' + rows + 'x' + columns + ' matrix')
		}
		////END DEV

		this.model.set('matrix', data)
	},

	// apply transformations as defined in the model, and get back get calculated matrix
	getMatrix: function() {
		var matrix = this.model.get('matrix'),
			t = this.model.get('transformations')

		// perspective
		matrix = matrixUtilities.multiply(matrix, t.perspective)

		// translate
		matrix = matrixUtilities.multiply(matrix, t.translate)

		// rotate
		matrix = matrixUtilities.multiply(matrix, t.rotate)

		// skew
		matrix = matrixUtilities.multiply(matrix, t.skew)

		// scale
		matrix = matrixUtilities.multiply(matrix, t.scale)

		return matrixUtilities.flip(matrix)
	},

	// get matrix formatted as a string that can be plugged right into CSS's `transform` function
	getMatrixCSS: function() {
		return 'matrix3d(' + this
			.getMatrix()
			.reduce(function (flat, row) {
				flat.push.apply(flat, row)
				return flat
			}, []).join(',') + ')';
	},

	// transform functions
	// 1-to-1 with their CSS equivalents
	rotate     : function (a) { return this.rotateZ(a) },
	rotateX    : function (a) { return this.rotate3d(1, 0, 0, a) },
	rotateY    : function (a) { return this.rotate3d(0, 1, 0, a) },
	rotateZ    : function (a) { return this.rotate3d(0, 0, 1, a) },
	scale      : function (x, y) { return this.scale3d(x, y) },
	scaleX     : function (x) { return this.scale3d(x) },
	scaleY     : function (y) { return this.scale3d(null, y) },
	scaleZ     : function (z) { return this.scale3d(null, null, z) },
	skewX      : function (x) { return this.skew(x) },
	skewY      : function (y) { return this.skew(null, y) },
	translate  : function (x, y) { return this.translate3d(x, y) },
	translateX : function (x) { return this.translate3d(x) },
	translateY : function (y) { return this.translate3d(null, y) },
	translateZ : function (z) { return this.translate3d(null, null, z) },

	perspective: function (x) {
		if (x == null) {
			x = 0
		}

		////DEV
		if (typeof x !== 'number') {
			throw new TypeError('expected parameter `x` to be a Number, but was given a ' + typeof x)
		}
		////END DEV

		this.model.set('transformations/perspective', transformToMatrix.perspective(x))
		return this;
	},

	rotate3d: function (x, y, z, a) {

		if (x == null) {
			x = 0
		}
		if (y == null) {
			y = 0
		}
		if (z == null) {
			z = 0
		}
		if (a == null) {
			a = 0
		}

		////DEV
		if (typeof x !== 'number') {
			throw new TypeError('expected parameter `x` to be a Number, but was given a ' + typeof x)
		}
		if (typeof y !== 'number') {
			throw new TypeError('expected parameter `y` to be a Number, but was given a ' + typeof y)
		}
		if (typeof z !== 'number') {
			throw new TypeError('expected parameter `z` to be a Number, but was given a ' + typeof z)
		}
		////END DEV

		// if angle was passed as a string, convert it to a float first
		this.model.set('transformations/rotate', transformToMatrix.rotate3d(x, y, z, _getRad(a)))

		return this;
	},

	scale3d: function (x, y, z) {

		if (x == null) {
			x = 1
		}
		if (y == null) {
			y = 1
		}
		if (z == null) {
			z = 1
		}

		////DEV
		if (typeof x !== 'number') {
			throw new TypeError('expected parameter `x` to be a Number, but was given a ' + typeof x)
		}
		if (typeof y !== 'number') {
			throw new TypeError('expected parameter `y` to be a Number, but was given a ' + typeof y)
		}
		if (typeof z !== 'number') {
			throw new TypeError('expected parameter `z` to be a Number, but was given a ' + typeof z)
		}
		////END DEV

		this.model.set('transformations/scale', transformToMatrix.scale3d(x, y, z))

		return this;
	},

	skew: function (x, y) {

		if (x == null) {
			x = 0
		}
		if (y == null) {
			y = 0
		}

		this.model.set('transformations/skew', matrixUtilities.to3d(transformToMatrix.skew(_getRad(x), _getRad(y))))

		return this;
	},

	translate3d: function(x, y, z) {

		if (x == null) {
			x = 0
		}
		if (y == null) {
			y = 0
		}
		if (z == null) {
			z = 0
		}

		////DEV
		if (typeof x !== 'number') {
			throw new TypeError('expected parameter `x` to be a Number, but was given a ' + typeof x)
		}
		if (typeof y !== 'number') {
			throw new TypeError('expected parameter `y` to be a Number, but was given a ' + typeof y)
		}
		if (typeof z !== 'number') {
			throw new TypeError('expected parameter `z` to be a Number, but was given a ' + typeof z)
		}
		////END DEV

		this.model.set('transformations/translate', transformToMatrix.translate3d(x, y, z))

		return this;
	}

};

return Matrixee;

});
