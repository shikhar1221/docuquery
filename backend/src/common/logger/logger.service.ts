import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printMessage('log', message, context || this.context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage('error', message, context || this.context);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    this.printMessage('warn', message, context || this.context);
  }

  debug(message: any, context?: string) {
    this.printMessage('debug', message, context || this.context);
  }

  verbose(message: any, context?: string) {
    this.printMessage('verbose', message, context || this.context);
  }

  private printMessage(level: string, message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
    const contextInfo = context ? `[${context}]` : '';
    
    console.log(`${timestamp} [${level.toUpperCase()}]${contextInfo} ${formattedMessage}`);
  }
}