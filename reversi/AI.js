const W_WEIGTH = 5;
const W_SELF_MOBILITY = 1;
const W_OPP_MOBILITY = 1;
const MIN_VALUE = -9999999;

var weight = [];

for (var i = 0; i < 8; i++)
{
	weight[i] = [];
}
//Four corners
weight[0][0] = 100;
weight[7][7] = 100;
weight[0][7] = 100;
weight[7][0] = 100;

//red crosses
weight[0][1] = -10;
weight[0][6] = -10;
weight[1][0] = -10;
weight[1][7] = -10;
weight[6][0] = -10;
weight[6][7] = -10;
weight[7][1] = -10;
weight[7][6] = -10;

//black crosses
weight[1][1] = -80;
weight[1][6] = -80;
weight[6][1] = -80;
weight[6][6] = -80;

//
for (var i = 2; i <= 5; i++)
{
	//red lines
	weight[i][0] = 15;
	weight[i][7] = 15;

	//black lines
	weight[i][1] = 3;
	weight[i][6] = 3;

	//green lines
	weight[i][2] = 8;
	weight[i][5] = 8;
}

for (var j = 2; j <= 5; j++)
{
	//red lines
	weight[0][j] = 15;
	weight[7][j] = 15;

	//black lines
	weight[1][j] = 3;
	weight[6][j] = 3;

	//green lines
	weight[2][j] = 8;
	weight[5][j] = 8;
}

var ai = {
	originalBoard:{},
	bestMoveX:-1,
	bestMoveY:-1,

	getMobility:function(player)
	{
		return this.originalBoard.getNoPossibleMoves(player);
	},
	
	computeWeight:function(board, player)
	{
		var result = 0;
		for (var i = 0; i < 8; i++)
		{
			for (var j = 0; j < 8; j++)
			{
				result += board.positions[i][j] * weight[i][j];
			}
		}
		if (player == 1)
			return result
		else
			-result;
	},

	evaluation:function(board, player)
	{
		return W_WEIGTH * this.computeWeight(board, player) + W_SELF_MOBILITY * this.getMobility(player); //-W_OPP_MOBILITY * getMobility(-player);
	},

	alphaBeta:function(alpha, beta, pass, depth, player, previousBoard)
	{
		var subBestX = -1;
		var subBestY = -1;
		var bestValue = MIN_VALUE;

		if (depth <= 0)
			return this.evaluation(previousBoard, player);

		//Try every possible position
		for (var i = 0; i < 8; i++ )
		{
			for (var j = 0; j < 8; j++)
			{
				var nextBoard = previousBoard.cloneboard();
				if (nextBoard.flipPiece(i, j, false, player))
				{
					var value = -this.alphaBeta(-beta, -alpha, 0, depth - 1, -player, nextBoard);

					if (value > beta)
						return value;
					if (value > bestValue)
					{
						bestValue = value;
						subBestX = i;
						subBestY = j;

						if (value > alpha)
							alpha = value;
					}
				}
			}
		}

		if (bestValue <= MIN_VALUE)
		{
			if (pass == 0)
			{
				//here may be needed to be modified
				//since the game is over, the player can win then the weight should be
				//very large to assure he can win
				return previousBoard.computeScore(player) * 1000; 
			}
			//DoPassMove();
			bestValue = -this.alphaBeta(-beta, -alpha, 1, depth, -player,previousBoard);
			//UnDoPassMove();
		}

		this.bestMoveX = subBestX;
		this.bestMoveY = subBestY;
		return bestValue;
	},

	makeBestMove:function(board)
	{
		this.bestMoveX = -1;
		this.bestMoveY = -1;
		this.originalBoard = board;
		this.alphaBeta(-50000, 50000, 0, 7, this.originalBoard.currentPlayer, board);
		return { x: this.bestMoveX, y: this.bestMoveY};
	}
}

export { ai };
