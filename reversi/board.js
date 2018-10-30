import { ai } from './AI.js';

const white = 1;
const black = -1;
const nocolor = 0;
const gameModePlayer = 0;
const gameModeAI = 1;
const startPlayerPlayer = -1;
const startPlayerAI = 1;

var boardstack = [];

var board = {
	positions:[],
	currentPlayer:white,
	lastPlayX:-1,
	lastPlayY:-1,
	noOfPieces:4,
	gameMode:gameModePlayer,
	startPlayer:startPlayerPlayer,
	init:function()
	{
		for (var i = 0; i < 8; i++)
		{
			this.positions.push([]);
			for (var j = 0; j < 8; j++) 
				this.positions[i][j] = nocolor;
		}
		this.positions[3][3] = this.positions[4][4] = white;
		this.positions[3][4] = this.positions[4][3] = black;
		this.noOfPieces = 4;
		
		this.currentPlayer = 1;
		this.lastPlayX = this.lastPlayY = -1;
	},

	getCurrentGameStatus:function()
	{
		if (this.currentPlayer == 1)
			return "White player playing..."
		else
			return "Black player playing...";
	},

	isCurrentPlayerAI:function()
	{
		if (this.gameMode == gameModePlayer)
			return false;
		else
			return this.currentPlayer * this.startPlayer == 1;
	},

	play:function(direcX, direcY, isAI)
	{
		var statusCode = -2;
		var result;
		var resultArray = [];
		if (direcX != -2 || direcY != -2)
		{
			if (this.positions[direcX][direcY] == nocolor)
			{
				var previous = this.cloneboard();
				if (this.flipPiece(direcX, direcY, false, this.currentPlayer))
				{
					this.lastPlayX = direcX;
					this.lastPlayY = direcY;
					if (this.noOfPieces == 64)
					{
						result = this.endGame();
						statusCode = 1;
					}
					if (!isAI)
						boardstack.push(previous);
				}
				else if (isAI)
				{
					result = "Error: AI try to put in invalid place " + direcX + "/" + direcY;
					statusCode = 3;
				}
				else
				{
					result = "";
					statusCode = -1;
				}

			}
			else if (!isAI)
			{
				result = "";
				statusCode = -1;
			}
		}

		if (statusCode != -1 && statusCode != 1 && statusCode != 3)
		{
			var noPossibleMoves = this.getNoPossibleMoves(this.currentPlayer);
			if (noPossibleMoves == 0)
			{
				this.currentPlayer = -this.currentPlayer;

				noPossibleMoves = this.getNoPossibleMoves(this.currentPlayer);
				if (noPossibleMoves == 0)
				{
					result = this.endGame();
					statusCode = 1;
				}

				result = this.currentPlayer == white ? "No possible move for black player. White player plays again" : "No possible move for white player. Black player plays again";
				statusCode = 2;
			}
			else
			{
				result = this.currentPlayer == white ? "White player playing..." : "Black player playing...";
				statusCode = 0;
			}
			if (this.isCurrentPlayerAI() && this.gameMode == gameModeAI && (statusCode == 0 || statusCode == 2) && isAI)
			{
				statusCode = this.AIPlay(result);
				if (statusCode == -1)
				{
					result = "Error: AI failed to move";
					statusCode = 3;
				}
			}
		}
		resultArray[0] = statusCode;
		resultArray[1] = result;
		return resultArray;
	},

	AIPlay:function(result)
	{
		var move = ai.makeBestMove(this.cloneboard());
		if (move && move.x == -1 && move.y == -1)
		{
			result = "";
			return -1;
		}
		else
		{
			this.play(move.x, move.y, true);
		}
		return 0;
	},

	getNoPossibleMoves:function(player)
	{
		var result = 0;
		for (var i = 0; i < 8; i++)
		{
			for (var j = 0; j < 8; j++)
			{
				if (this.positions[i][j] == nocolor && this.flipPiece(i, j, true, player))
				{
					result++;
				}
			}
		}
		return result;
	},

	computeScore:function(player)
	{
		var result = 0;
		for (var i = 0; i < 8; i++)
		{
			for (var j = 0; j < 8; j++)
			{
				result += this.positions[i][j];
			}
		}
		return player == 1 ? result : -result;
	},

	computeNoPieces:function()
	{
		var numberwhite = 0;
		var numberblack = 0;
		var color;
		for (var i = 0; i < 8; i++)
		{
			for (var j = 0; j < 8; j++)
			{
				color = this.positions[i][j];
				if (color == white)
					numberwhite++;
				else if (color == black)
					numberblack++;
			}
		}
		return 'White (' +  white + ') : Black(' + black + ')';
	},

	endGame:function()
	{
		var result = 0;
		for (var i = 0; i < 8; i++)
		{
			for (var j = 0; j < 8; j++)
			{
				result += this.positions[i][j];
			}
		}
		if (result > 0)
		{
			return "White player won!";
		}
		else if (result < 0)
		{
			return "Black player won!";
		}
		else
			return "Draw Game!";
	},

	flipPiece:function(x, y, checkOnly, player)
	{
		//var processedPosition = [];
		var positionToFlip = [];
		if (this.positions[x][y] != nocolor)
			return null;
		var direction = 0;
		var i = 1;
		var j = 1;
		var deltaX = i;
		var deltaY = j;
		var toFlip = false;
		var tempI;
		var tempJ;
		var temp;
		
		var flipped = false;

		for (direction = 0; direction < 8; direction++)
		{
			while ((x + i) >= 0 && (y + j) >= 0 && (x + i) >= 0 && (y + j) >= 0 && (x + i) < 8 && (y + j) < 8)
			{
				if (this.positions[x + i][y + j] == player)
				{
					toFlip = true;
					break;
				}
				else if (this.positions[x + i][y + j] == 0)
					break;
				else
				{
					positionToFlip.push({x:x + i, y:y + j});
				}
				i = i + deltaX;
				j = j + deltaY;
			}
			if (toFlip && !checkOnly)
			{
				for (temp = 0; temp < positionToFlip.length; temp++)
				{
					this.positions[positionToFlip[temp].x][positionToFlip[temp].y] = this.currentPlayer;
				}
			}
			if (toFlip && positionToFlip.length > 0)
				flipped = true;
			i = deltaX * !Boolean(deltaX + deltaY == 0) + !Boolean(deltaX) * deltaY;
			j = deltaY * !Boolean(deltaX == deltaY) - !Boolean(deltaY) * deltaX;
			deltaX = i;
			deltaY = j;
			toFlip = false;
			positionToFlip.length = 0;
		}
		
		if (flipped && !checkOnly)
		{
			this.noOfPieces++;
			this.positions[x][y] = this.currentPlayer;
			this.currentPlayer = -this.currentPlayer;
			return true;
		}
		else if (flipped && checkOnly)
			return true;
		else
			return false;
	},
	
	cloneboard:function()
	{
		var copy = JSON.parse(JSON.stringify(this));
		var that = this;
		Object.getOwnPropertyNames(that).filter(function(p) { if (typeof that[p] === 'function') copy[p] = that[p]; });
		return copy;
	}
}


export { board, white, black, nocolor };
