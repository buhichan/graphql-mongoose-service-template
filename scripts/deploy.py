import sys
import os

production = { 'ip': '172.28.39.112'}

def main():
    help = """
    example: python deploy.py targetDir version
    """
    if len(sys.argv) != 3:
        target = 'graphql_test'
        version = 'current'
        print('usage: python deploy.py targetDir version')
        return
    else:
        target = sys.argv[1]
        version = sys.argv[2]
    print("target:",target)
    print("available versions:",os.listdir('../build'))
    if not os.path.exists('../build/'+version):
        print('version not found')
        sys.exit()

    status = os.system('sh single.sh ' + target + ' '+version+' ' + production['ip'])
    print status

if __name__ == '__main__':
    main()
