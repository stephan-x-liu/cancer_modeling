import pandas
import numpy
import json

def data_reshape(data, proteins, cell_lines, tf, start=0):
	columns = cell_lines * 2
	rows = proteins * tf
	cell_lines_array = []
	for line in range(cell_lines):
		cell_line_array = []
		for protein in range(proteins):
			start_row = start + protein * tf
			end_row = start_row + tf
			col1 = line * 2
			col2 = line * 2 + 1
			exp1 = [data[col1][x] for x in range(start_row, end_row)]
			exp2 = [data[col2][x] for x in range(start_row, end_row)]
			cell_line_array.append(exp1+exp2)
		cell_lines_array.append(cell_line_array)
	return cell_lines_array

def M_to_JSON(csv, proteins, cell_lines, tf, output):
	M = pandas.read_csv(csv, header=None)
	M_json = data_reshape(M, proteins, cell_lines, tf)
	with open(output, "w") as outfile:
		json.dump(M_json, outfile)

def L_or_S_to_JSON(csv, proteins, cell_lines, tf, lambdas, output):
	matrix = pandas.read_csv(csv, header=None)
	data_dict = dict()
	rows_per_lambda = proteins * tf
	for i, lam in enumerate(lambdas):
		print i,lam
		start_row = i * rows_per_lambda
		end_row = start_row + rows_per_lambda
		print start_row,end_row
		data_dict[lam] = data_reshape(matrix[start_row:end_row],
			proteins, cell_lines, tf, start_row)
	with open(output, "w") as outfile:
		json.dump(data_dict, outfile)