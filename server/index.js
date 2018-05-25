const db = require('rethinkdb');
const io = require('socket.io')();

function createDrawing({ connection, name }) {
  return db.table('drawings')
    .insert({
      name,
      timestamp: new Date()
    })
    .run(connection)
    .then(() => console.log('created a new drawing with name ', name));
}

function subscribeToDrawings({ client, connection }) {
  db.table('drawings')
    .changes({ include_initial: true })
    .run(connection)
    .then((cursor) => {
      cursor.each((err, drawingRow) =>
        client.emit('drawing', drawingRow.new_val)
      );
    });
}

function handleLinePublish({ connection, line, callback }) {
  console.log('saving line to the db');
  db.table('lines')
    .insert(Object.assign(line, { timestamp: new Date() }))
    .run(connection)
    .then(callback);
}

function subscribeToDrawingLines({ client, connection, drawingId, from }) {
  let query = db.row('drawingId').eq(drawingId);

  if (from) {
    query = query.and(db.row('timestamp').ge(new Date(from)));
  }

  return db.table('lines')
    .filter(query)
    .changes({ include_initial: true, include_types: true })
    .run(connection)
    .then((cursor) => {
      cursor.each((err, lineRow) =>
        client.emit(`drawingLine:${drawingId}`, lineRow.new_val)
      );
    });
}

db.connect({
    host: 'localhost',
    port: 28015,
    db: 'awesome_whiteboard'
  })
  .then((connection) => {
    io.on('connection', (client) => {
      client.on('createDrawing', ({ name }) => {
        createDrawing({ connection, name });
      });

      client.on('subscribeToDrawings', () =>
        subscribeToDrawings({
          client,
          connection
        })
      );

      client.on('publishLine', (line, callback) =>
        handleLinePublish({
          line,
          connection,
          callback
        })
      );

      client.on('subscribeToDrawingLines', ({ drawingId, from }) => {
        subscribeToDrawingLines({
          client,
          connection,
          drawingId,
          from
        });
      });
    });
  });

const port = parseInt(process.argv[2], 10) || 8000;
io.listen(port);
console.log('listening on port ', port);
