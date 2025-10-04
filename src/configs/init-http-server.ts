import http from 'http';

import mongoose from 'mongoose';

export default async function initHttpServer(server: http.Server) {
  const { HOST, PORT } = process.env;
  try {
    const {
      connection: { host: db_host, port: db_port, name: db_name },
    } = await mongoose.connect(process.env.DB_URL!);

    console.clear();
    console.log(
      `Connected to Database\nhost: ${db_host}:${db_port}\nDatabase: ${db_name}\n`,
    );

    server.listen(+PORT!, HOST, () => {
      console.log(
        `Server is running on http://${HOST}:${PORT} in '${process.env.NODE_ENV?.toUpperCase()}' mode`,
      );
    });
  } catch (error) {
    console.log(error);
  }
}
