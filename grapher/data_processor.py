import pandas
import sys
import json
import argparse
import numpy as np

def data_reshape(data, proteins, cell_lines, tf, exps):
	rows = len(proteins) * tf
	cell_lines_dict = {}
	for l, line in enumerate(cell_lines):
		cell_line_dict = {}
		for p, protein in enumerate(proteins):
			protein_line = {}
			start = 0
			end = tf
			for e, exp in enumerate(exps):
				temp = [data[len(proteins) * x + p, l*len(exps) + e] for x in range(start, end)]
				protein_line[exp] = temp
			cell_line_dict[protein] = protein_line
		cell_lines_dict[line] = cell_line_dict
	return cell_lines_dict

def M_to_JSON(csv, proteins, cell_lines, tf, exps, output):
	M = pandas.read_csv(csv, header=None)
	M_json = data_reshape(M.as_matrix(), proteins, cell_lines, tf, exps)
	with open(output, "w") as outfile:
		json.dump(M_json, outfile)
	return M.as_matrix().flatten().max(), M.as_matrix().flatten().min()

def L_or_S_to_JSON(csv, proteins, cell_lines, tf, exps, lambdas, output, t_csv):
	matrix = pandas.read_csv(csv, header=None)
	T = pandas.read_csv(t_csv, header=None)
	data_dict = dict()
	rows_per_lambda = len(proteins) * tf
	max_value, min_value = -999999999, 9999999999
	for i, lam in enumerate(lambdas):
		start_row = rows_per_lambda * i
		end_row = start_row + rows_per_lambda
		muled = np.dot(np.linalg.inv(T[start_row:end_row].as_matrix()),
			matrix[start_row:end_row].as_matrix())
		max_value = max(muled.flatten().max(), max_value)
		min_value = min(muled.flatten().min(), min_value)
		data_dict[lam] = data_reshape(muled,
			proteins, cell_lines, tf, exps)
	with open(output, "w") as outfile:
		json.dump(data_dict, outfile)
	return max_value, min_value
	

def proccess_all_data(lambdas, M, L, S, T, proteins, cell_lines, tf, exps):
	lambda_lines = file(lambdas).readlines()
	lambdas = [x.strip() for x in lambda_lines]
	protein_lines = file(proteins).readlines()
	proteins = [x.strip() for x in protein_lines]
	cell_lines_file = file(cell_lines).readlines()
	cell_lines = [x.strip() for x in cell_lines_file]
	exp_lines = file(exps).readlines()
	exps = [x.strip() for x in exp_lines]
	ma3, mi3 = M_to_JSON(M, proteins, cell_lines, tf, exps, "M.json")
	ma1, mi1 = L_or_S_to_JSON(L, proteins, cell_lines, tf, exps, lambdas, "L.json", T)
	ma2, mi2 = L_or_S_to_JSON(S, proteins, cell_lines, tf, exps, lambdas, "S.json", T)
	max_value = max(ma1, ma2, ma3)
	min_value = min(mi1, mi2, mi3)
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
	p.add_argument("T")
	p.add_argument("proteins")
	p.add_argument("cell_lines")
	p.add_argument("tf")
	p.add_argument("exps")
	if args == None:
		args = p.parse_args(sys.argv[1:])
	else:
		args = p.parse_args(args)
	proccess_all_data(args.lambdas, args.M, args.L,
		args.S, args.T, args.proteins, args.cell_lines,
		int(args.tf), args.exps)

if __name__ == '__main__':
    main()

