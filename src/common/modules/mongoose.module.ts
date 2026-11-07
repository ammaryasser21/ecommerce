
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],

            useFactory: (config: ConfigService) => ({
                uri: config.getOrThrow<string>('MONGO_URI'),

                connectionFactory: (connection) => {
                    console.log('MongoDB connection created');

                    connection.on('connected', () => {
                        console.log('MongoDB connected successfully ...');
                    });

                    connection.on('disconnected', () => {
                        console.log('MongoDB disconnected');
                    });

                    connection.on('error', (error: any) => {
                        console.error('MongoDB connection error:', error);
                    });

                    return connection;
                },
            }),
        }),
    ],
})
export class DatabaseModule { }
