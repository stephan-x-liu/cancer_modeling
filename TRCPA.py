#sys.path.insert(0, '/usr/local/lib')
import cvxpy as cvx
import numpy as np
import scipy as sp
import pandas
import ecos



def diag(offset, a, n):
	if isinstance(a,list):
		a_matrices = a
	elif isinstance(a,tuple):
		a_matrices = list(a)
	else:
		a_matrices = np.hsplit(a,a.shape[1]/n)
	height = a_matrices[0].shape[0]
	total_height = height*(len(a_matrices) + abs(offset))
	print(total_height)
	for x in range(len(a_matrices)):
		if(offset<0):
			temp = (abs(offset)+x)*height
			top = np.zeros((int(temp),int(n)))
		else:
			top = np.zeros((x*height,n))
		if(offset<0):
			temp = total_height-((abs(offset)+x+1)*height)
			bottom = np.zeros((int(temp),int(n)))
		else:
			bottom = np.zeros((total_height-((x+1)*height),n))
		a_matrices[x] = np.vstack((top,a_matrices[x],bottom))
	if offset<0:
		extra = np.zeros((total_height,abs(offset)*n))
		a_matrices = a_matrices + [extra]
	elif offset>0:
		extra = np.zeros((total_height,abs(offset)*n))
		a_matrices = [extra] + a_matrices
	return np.hstack(tuple(a_matrices))

def TRCPA_v1(M,n,tf,q,lam):
	Avars = []
	for i in range(tf-1):
		Avars.append(cvx.Variable(n,n))
	Ltop = cvx.Variable(n,q)
	Lbottom = np.zeros((n*(tf-1),q))
	L = cvx.vstack(Ltop,Lbottom)
	S = cvx.Variable(n*tf,q)

	print("Check 1")
	objective = cvx.Minimize(cvx.norm(L,"nuc") + lam*cvx.norm(S,1))
	identity = np.eye(n)
	print("Check 2")
	constraints = [np.dot(identity,M[0:n,:])==Ltop+S[0:n,:]]

	for i in range(tf-1):
		constraints.append(-1*Avars[i]*M[(i*n):(i+1)*n,:] + np.dot(identity,M[((i+1)*n):(i+2)*n,:])==L[((i+1)*n):(i+2)*n,:]+S[((i+1)*n):(i+2)*n,:])
		
	print("Check 3")
	print(constraints)
	prob = cvx.Problem(objective,constraints)
	print("Check 4")
	result = prob.solve(verbose = True)
	print("Check 5")
	Ltop_final = Ltop.value
	Avars_final = []
	for x in Avars:
		Avars_final.append(x.value)
	S_final = S.value
	return (Avars_final,Ltop_final,Lbottom,S_final)


def TRCPA_v2(M,n,tf,q,lam):
	Avars = []
	for i in range(tf-1):
		Avars.append(cvx.Variable(n,n))
	Ltop = cvx.Variable(n,q)
	Lbottom = np.zeros((n*(tf-1),q))
	L = cvx.vstack(Ltop,Lbottom)
	S = cvx.Variable(n*tf,q)

	print("Check 1")
	objective = cvx.Minimize(cvx.norm(L,"nuc") + lam*np.ones((1,n*tf))*cvx.abs(S)*np.ones((q,1)))
	identity = np.eye(n)
	print("Check 2")
	constraints = [np.dot(identity,M[0:n,:])==Ltop+S[0:n,:]]

	for i in range(tf-1):
		constraints.append(-1*Avars[i]*M[(i*n):(i+1)*n,:] + np.dot(identity,M[((i+1)*n):(i+2)*n,:])==L[((i+1)*n):(i+2)*n,:]+S[((i+1)*n):(i+2)*n,:])
		
	print("Check 3")
	print(constraints)
	prob = cvx.Problem(objective,constraints)
	print("Check 4")
	result = prob.solve(verbose = True)
	print("Check 5")
	Ltop_final = Ltop.value
	Avars_final = []
	for x in Avars:
		Avars_final.append(x.value)
	S_final = S.value
	return (Avars_final,Ltop_final,Lbottom,S_final)

lambdas = [
		0.15,#0.1525,0.1550,0.1575,
		0.16,#0.1625,0.1650,0.1675,
		0.17,#0.1725,0.1750,0.1775,
		0.18,#0.1825,0.1850,0.1875,
		0.19,#0.1925,0.1950,0.1975,
		0.20,#0.2025,0.2050,0.2075,
		0.21,#0.2125,0.2150,0.2175,
		0.22]


def run_TRCPA_v1(lambda_value):
	# Replace with file path for M csv file.
	M_dat = pandas.read_csv("TestData_Stephan/TestData_M.csv",header = None)
	M = M_dat.as_matrix()	
	data = TRCPA_v1(M,6,13,6,lambda_value)
	Avars = data[0]
	Ltop = data[1]
	L = np.vstack((Ltop,np.zeros((6*(13-1),6))))
	S = data[3]
	T = diag(-1,Avars,6)
	T = -1*T
	T = T + np.eye(78)
	pandas.DataFrame(T).to_csv(str(lambda_value)+"_T.csv")
	LT = np.dot(T.getI(),L)
	ST = np.dot(T.getI(),S)
	L_dat = pandas.DataFrame(L)
	S_dat = pandas.DataFrame(S)
	L_dat.to_csv(str(lambda_value)+"_L.csv")
	S_dat.to_csv(str(lambda_value)+"_S.csv")
	pandas.DataFrame(np.reshape(LT,(6,78),"F")).to_json(path_or_buf=str(lambda_value)+"_L.json",orient="values")
	pandas.DataFrame(np.reshape(ST,(6,78),"F")).to_json(path_or_buf=str(lambda_value)+"_S.json",orient="values")
	pandas.DataFrame(np.reshape(M,(6,78),"F")).to_json(path_or_buf=(str(lambda_value)+"_M.json"),orient="values")

def run_TRCPA_v2():
	# Replace with file path for M csv file.
	M_dat = pandas.read_csv("TestData_Stephan/TestData_M.csv",header = None)
	M = M_dat.as_matrix()

	
	# replace inputs with desired values
	data = TRCPA_v2(M,6,13,6,1.08)
	Avars = data[0]
	Ltop = data[1]
	L = np.vstack((Ltop,np.zeros((n*(tf-1),q))))
	S = data[3]
	T = diag(-1,Avars,6)
	T = -1*T
	T = T + np.eye(78)

	# replace filenames as desired
	pandas.DataFrame(T).to_csv("V2_T.csv")
	L_dat = pandas.DataFrame(L)
	S_dat = pandas.DataFrame(S)
	L_dat.to_csv("V2_L.csv")
	S_dat.to_csv("V2_S.csv")
	M_dat.to_json(path_or_buf="M.json",orient="values")
	L_dat.to_json(path_or_buf="L.json",orient="values")
	S_dat.to_json(path_or_buf="S.json",orient="values")


run_TRCPA_v1()



# def TRCPA_lti(M,n,tf,q,lam):
# 	Avars = Variable(n,n)
# 	Ltop = Variable(n,q)
# 	S = Variable(n*tf,q)
# 	L = vstack(Ltop,np.zeros((n*(tf-1),q)))
# 	objective = Minimize(norm(L,"nuc") + lam*norm(S,1))
# 	constraints = [tridiag(np.eye(n),-Avar,tf)*M==L+S]
# 	T_final = tridiag(np.eye(n),-Avar,tf)
# 	L_final = vstack(Ltop.value,np.zeros((n*(tf-1),q)))
# 	Avars_final = Avars.value
# 	S_final = s.value
# 	return (T_final,L_final,S_final,Avars_final)


