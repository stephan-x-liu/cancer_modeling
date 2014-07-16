
% T diagonal are Identity matrices, and the subdiagonal is -Ak matrices
% Avars is a list of A matrices per timestamp
% L is low rank
% S is sparse data
% TM = L+S



function [T,L,S,Avars] = TRPCA(M,n,tf,q,lambda,lti_or_v)

if lti_or_v == 'v'

    % convext optimization, use cvxopt for python

    cvx_begin

        % only varies diagonal for matrices

        % Vary first n rows of L, 
        variables Avars(n,n*(tf-1)) Ltop(n,q) S(n*tf,q)

        minimize(  norm_nuc([Ltop;zeros(n*(tf-1),q)]) + lambda*norm(S,1)  )

        subject to
        
        % reshape splits a matrix into n matrices
        blktridiag(reshape(kron(ones(1,tf),eye(n)),n,n,tf),reshape(-Avars,n,n,tf-1),reshape(zeros(n*(tf-1),n),n,n,tf-1))*M == [Ltop;zeros(n*(tf-1),q)] + S

    cvx_end

    T = blktridiag(reshape(kron(ones(1,tf),eye(n)),n,n,tf),reshape(-Avars,n,n,tf-1),reshape(zeros(n*(tf-1),n),n,n,tf-1));
    L = [Ltop;zeros(n*(tf-1),q)];
    Avars = Avars;
    
elseif lti_or_v == 'i'
    cvx_begin

        variables Avar(n,n) Ltop(n,q) S(n*tf,q)

        minimize(  norm_nuc([Ltop;zeros(n*(tf-1),q)]) + lambda*norm(S,1)  )

        subject to

        blktridiag(eye(n),-Avar,zeros(n),tf)*M == [Ltop;zeros(n*(tf-1),q)] + S

    cvx_end

    T = blktridiag(eye(n),-Avar,zeros(n),tf);
    L = [Ltop;zeros(n*(tf-1),q)];
    Avars = kron(ones(1,tf-1),Avar);

end