import sys
outfile = open('outfile.csv', 'w')
sys.stdout = outfile
vec = {x: 1, y: 2}
#print(f'{x}, {y}')
outfile.close()
