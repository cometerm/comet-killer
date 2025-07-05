#!/usr/bin/env node

import { Command } from "commander";
import findProcess from "find-process";    
import { execaCommand } from "execa";        
import chalk from "chalk";                    

const program = new Command();

program
  .name("port-killer")
  .description("Kill any process on a port, then run your command")
  .requiredOption("-p, --port <number>", "port to free")
  .allowUnknownOption(true)
  .argument("[--] [cmd...]", "command to run after freeing the port")
  .action(async (cmd, opts) => {
    const port = Number(opts.port);
    let killedCount = 0;

    try {
      const list = await findProcess("port", port);

      if (list.length) {
        for (const proc of list) {
          process.kill(proc.pid, "SIGKILL");
          console.log(chalk.green(`Killed pid=${proc.pid}`));
          killedCount++;
        }
       
        console.log(
          chalk.blue(`Successfully killed ${killedCount} process(es) on port ${port}`)
        );
      } else {
        console.log(chalk.yellow(`No process found on port ${port}`));
      }

      
      if (cmd.length) {
        await execaCommand(cmd.join(" "), { stdio: "inherit" });
      }
    } catch (err) {
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse(process.argv);