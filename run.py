from golfapp import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

# export SQLALCHEMY_DATABASE_URI=sqlite:///testing.db
# export SECRET_KEY='\x96\x97i\xd5\xc3\xc1\xc2\xce\x0egd_y\xe4\xa1!\x7fC\xa8\xfa\xa0\x15\xa2\x84'
# export SQLALCHEMY_DATABASE_URI=postgresql://baouwxygwzkdqt:a37616a7310dabb570ea5bf5f57a2dd69d85ccf1e942b80ec445e85c6aec3aad@ec2-54-211-176-156.compute-1.amazonaws.com:5432/d15m4igjfanpvj

