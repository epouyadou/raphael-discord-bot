export class StringBuilder {
  private readonly _parts: string[] = [];
  private readonly _indentationString: string = '    '; // Two spaces for indentation

  jumpLine(jumpCount: number = 1): StringBuilder {
    this._parts.push('\n'.repeat(jumpCount));
    return this;
  }

  append(value: string): StringBuilder {
    this._parts.push(value);
    return this;
  }

  appendBold(value: string): StringBuilder {
    this._parts.push(`**${value}**`);
    return this;
  }

  appendLine(value: string): StringBuilder {
    this._parts.push(value + '\n');
    return this;
  }

  appendLineBold(value: string): StringBuilder {
    this._parts.push(`**${value}**\n`);
    return this;
  }

  appendCodeBlock(code: string, language?: string): StringBuilder {
    this._parts.push('```');
    if (language) {
      this._parts.push(language + '\n');
    }
    this._parts.push(code + '\n');
    this._parts.push('```\n');
    return this;
  }

  private appendIndentation(indentCount: number = 1): void {
    const indentation = this._indentationString.repeat(indentCount);
    this._parts.push(indentation);
  }

  toString(): string {
    return this._parts.join('');
  }

  clear(): void {
    this._parts.length = 0;
  }
}
