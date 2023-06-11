from twisted.internet import reactor, ssl
from twisted.web import server, resource

sslContext = ssl.DefaultOpenSSLContextFactory(
    'privkey.pem',  # Private Key
    'snakeoil.pem',  # Certificate
)

class MainResource(resource.Resource):

    isLeaf = True

    def render_GET(self, request):
        request.responseHeaders.addRawHeader("Content-Type", "text/html; charset=utf-8")
        return "<html><body>Hello World</body></html>"


site = server.Site(MainResource())
reactor.listenSSL(443, site, sslContext)
reactor.run()