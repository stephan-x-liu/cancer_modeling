import pandas
import sys
import json
import argparse

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
		start_row = i * rows_per_lambda
		end_row = start_row + rows_per_lambda
		data_dict[lam] = data_reshape(matrix[start_row:end_row],
			proteins, cell_lines, tf, start_row)
	with open(output, "w") as outfile:
		json.dump(data_dict, outfile)

def proccess_all_data(lambdas, M, L, S, proteins, cell_lines, tf):
	lambda_lines = file(lambdas).readlines()
	lambdas = [x.strip() for x in lambda_lines]
	maxes = [pandas.read_csv(x).max().max() for x in [M,L,S]]
	mins =  [pandas.read_csv(x).min().min() for x in [M,L,S]]
	maxes.sort()
	mins.sort()
	max_value = maxes[-1]
	min_value = mins[0]
	M_to_JSON(M, proteins, cell_lines, tf, "M.json")
	L_or_S_to_JSON(L, proteins, cell_lines, tf, lambdas, "L.json")
	L_or_S_to_JSON(S, proteins, cell_lines, tf, lambdas, "S.json")
	with open("lambdas.json", "w") as outfile:
		json.dump(lambdas, outfile)
	with open("max_min.json", "w") as outfile:
		json.dump({"max_value": max_value, 
				   "min_value": min_value}, outfile)

def main(args=None):
	p = argparse.ArgumentParser()
	p.add_argument("lambdas")
	p.add_argument("M")
	p.add_argument("L")
	p.add_argument("S")
	p.add_argument("proteins")
	p.add_argument("cell_lines")
	p.add_argument("tf")
	if args == None:
		args = p.parse_args(sys.argv[1:])
	else:
		args = p.parse_args(args)
	proccess_all_data(args.lambdas, args.M, args.L, args.S, int(args.proteins), int(args.cell_lines), int(args.tf))

if __name__ == '__main__':
    main()

